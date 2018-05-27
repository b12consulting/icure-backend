class FilterPanel extends Polymer.mixinBehaviors([Polymer.IronResizableBehavior], Polymer.Element) {
  static get template() {
    return Polymer.html`
        <style>

            paper-card {
                width: calc(100% - 64px);
                margin: 0 32px 32px;

            }

            .pat-details-card > .card-content {
                padding: 16px 16px 32px !important;
            }

            .filters-panel {
                background: var(--app-light-color);
                @apply --padding-right-left-32;
                overflow: hidden;
                max-height: 80%;
                @apply --transition;
            }

            .filters-panel--collapsed {
                max-height: 0;
            }

            .filters-bar {
                background: var(--app-secondary-color);
                height: 40px;
                text-align: center;
                padding: 4px 0;
                width: var(--panel-width, 100%);
            }

            .hide-filters-btn {
                height: 40px;
                margin: 0 auto;
                width: 100%;
                font-size: 12px;
                font-weight: 500;
            }

            .hide-filters-btn:hover {
                background: var(--app-dark-color-faded);
                @apply --transition;
            }

            .show-filters-btn {
                height: 40px;
                font-size: 12px;
                font-weight: 500;
            }

            .show-filters-btn:hover {
                background: var(--app-dark-color-faded);
                @apply --transition;
            }

            .filters-bar--small {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                margin: 0 32px;

            }

            .filters-bar--small-icon:focus {
                background: rgba(0, 0, 0, .2);
                border-radius: 50%;
            }

            .filters-bar--small-icon {
                color: var(--app-primary-color-dark);
            }

            paper-input.search-input {
                --paper-input-container-color: var(--app-text-color-disabled);
                --paper-input-container-focus-color: var(--app-primary-color);
                --paper-input-container-input-color: var(--app-text-color);
            }

            .search-icon {
                height: 20px;
                width: 20px;
                color: var(--app-text-color);
            }

            .clear-search-button-icon {
                height: 26px;
                width: 26px;
                padding: 2px;
                margin-bottom: 6px;
                color: var(--app-text-color);
            }

            @media screen and (max-width: 1025px) {
                .filters-bar--small {
                    margin: 0 16px;
                }
            }
        </style>

        <div id="filtersPanel" is="dom-if" class="filters-panel filters-panel--collapsed">
            <paper-input id="searchInput" label="Search" class="search-input" value="{{searchString}}">
                <iron-icon class="search-icons" icon="icons:search" prefix=""></iron-icon>
                <paper-icon-button suffix="" on-click="clearInput" icon="clear" alt="clear" title="clear" class="clear-search-button-icon"></paper-icon-button>
            </paper-input>
            <paper-listbox focused="" on-selected-items-changed="selectMenu" multi="">
                <template is="dom-repeat" items="[[items]]" as="menu">
                    <paper-item>
                        <iron-icon class="filters-panel-icon" icon="[[menu.icon]]"></iron-icon>
                        [[menu.title]]
                    </paper-item>
                </template>
            </paper-listbox>
        </div>
        <div class="filters-bar">
            <paper-button is="dom-if" hidden\$="{{!showFiltersPanel}}" class="hide-filters-btn" on-tap="toggleFiltersPanel" name="hide-filters" role="button" tabindex="0" aria-disabled="false" elevation="0">
                Hide Filters
                <iron-icon icon="icons:expand-less"></iron-icon>
            </paper-button>
            <div is="dom-if" hidden\$="{{showFiltersPanel}}">
                <div class="filters-bar--small">
                    <div>
                        <template is="dom-repeat" items="[[icons]]" as="icon">
                            <paper-icon-button id="[[icon.id]]-btn" class="filters-bar--small-icon" icon="[[icon.icon]]"></paper-icon-button>
                        </template>
                    </div>
                    <paper-button class="show-filters-btn" on-tap="toggleFiltersPanel" name="show-filters" role="button" tabindex="0" aria-disabled="false" elevation="0">
                        Show Filters
                        <iron-icon icon="icons:expand-more"></iron-icon>
                    </paper-button>
                </div>
            </div>
        </div>
        <div>
            <template is="dom-repeat" items="[[icons]]" as="icon">
                <paper-tooltip for="[[icon.id]]-btn">[[icon.title]]</paper-tooltip>
            </template>
        </div>
`;
  }

  static get is() {
    return 'filter-panel'
  }

  static get properties() {
    return {
      items: {
        type: Array,
        value: []
      },
      icons: {
        type: Array,
        computed: "computeIcons(panelWidth,items)"
      },
      showFiltersPanel: {
        type: Boolean,
        value: false
      },
      panelWidth: {
        type: Number,
        value: 200
      },
      selectedIcon: {
        type: String,
        notify: true,
        value: null
      },
      searchString: {
        type: String,
        notify: true,
        value: null
      }
    }
  }

  ready() {
    super.ready()
    this.addEventListener('iron-resize', () => this.onWidthChange())
  }

  attached() {
    super.attached()
    this.async(this.notifyResize, 1)
  }

  onWidthChange() {
    this.set('panelWidth', this.parentElement.offsetWidth - Array.from(this.parentElement.children).filter(el => el !== this).map(x => x.offsetWidth).reduce((sum, w) => sum + w, 0))
  }

  refreshIcons() {
    this.onWidthChange()
  }

  computeIcons(width, items) {
    return items.filter((it, idx) => it.icon && idx * 40 < width - 255)
  }

  clearInput() {
    this.$.searchInput.value = ""
  }

  toggleFiltersPanel() {
    this.showFiltersPanel = !this.showFiltersPanel
    this.root.querySelector('#filtersPanel').classList.toggle('filters-panel--collapsed')
  }
}

customElements.define(FilterPanel.is, FilterPanel)