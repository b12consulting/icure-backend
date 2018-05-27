const $_documentContainer = document.createElement('template');
$_documentContainer.setAttribute('style', 'display: none;');

$_documentContainer.innerHTML = `<dom-module id="material-text-field-custom" theme-for="vaadin-text-field">
    <template>
        <style>
            :host {
                padding-top: 8px;
                margin-bottom: 0px;
            }

            [part="value"] {
                font-size: var(--form-font-size);
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
class DynamicPopupMenu extends Polymer.mixinBehaviors([Polymer.IronResizableBehavior], Polymer.Element) {
  static get template() {
    return Polymer.html`
        <style>
            :host {
                flex-grow: var(--dynamic-field-width, 50);
                position: relative;
                min-width: calc(var(--dynamic-field-width-percent, '50%') - 32px);
                margin: 0 16px;
            }

            dynamic-link {
                position: absolute;
                right: 0;
                top: 8px;
            }

            .modified-icon {
                width: 18px;
            }

            .modified-previous-value {
                color: var(--app-text-color-disabled);
                text-decoration: line-through;
                font-style: italic;
            }

            .modified-before-out {
                color: var(--app-secondary-color-dark);
                text-align: right;
                float: right;
                font-style: italic;
                border-bottom: 1px dotted var(--app-secondary-color-dark);
            }

            .modified-after-out {
                color: var(--app-secondary-color-dark);
                text-align: right;
                float: right;
                font-style: italic;
                border-bottom: 1px dotted var(--app-secondary-color-dark);
            }

            paper-input-container {
                --paper-input-container-focus-color: var(--app-primary-color);
                --paper-input-container-label: {
                    color: var(--app-text-color);
                    opacity: 1;
                };
                --paper-input-container-underline-disabled: {
                    border-bottom: 1px solid var(--app-text-color);

                };
                --paper-input-container-color: var(--app-text-color);
            }

            vaadin-combo-box {
                width: 100%;
                font-size: 11px;
            }

            paper-menu-button {
                padding: 0;
            }

            paper-listbox {
            }

            input {
                border: none;
                width: calc(100% - 24px);
                outline: 0;
                background: none;
                font-size: var(--form-font-size);
            }
        </style>

        <template is="dom-if" if="[[readOnly]]">
            <paper-input-container always-float-label="true">
                <label slot="label">[[label]]
                    <template is="dom-if" if="[[wasModified]]">
                        <span class="modified-before-out">modified [[lastModified]] <iron-icon class="modified-icon" icon="schedule"></iron-icon></span>
                    </template>
                    <template is="dom-if" if="[[isModifiedAfter]]">
                        <span class="modified-after-out">[[localize('obs_val','obsolete value',language)]]<iron-icon class="modified-icon" icon="report-problem"></iron-icon></span>
                    </template>
                </label>
                <iron-input slot="input" bind-value="{{value}}">
                    <input readonly="" type="text" value="{{value::input}}" on-tap="_openPopupMenu">
                </iron-input>
                <paper-menu-button slot="suffix" horizontal-offset="[[listboxOffsetWidth]]">
                    <iron-icon icon="paper-dropdown-menu:arrow-drop-down" slot="dropdown-trigger"></iron-icon>
                    <paper-listbox id="dropdown-listbox" slot="dropdown-content" selected="{{selected}}">
                        <paper-item>[[localize('auc','Aucun',language)]]</paper-item>
                        <template is="dom-repeat" items="[[options]]">
                            <paper-item>[[item]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-menu-button>
            </paper-input-container>
        </template>
        <template is="dom-if" if="[[!readOnly]]">
            <template is="dom-if" if="[[!dataSource]]">
                <paper-input-container always-float-label="true">
                    <label slot="label">[[label]]
                        <template is="dom-if" if="[[wasModified]]">
                            <span class="modified-before-out">modified [[lastModified]] <iron-icon class="modified-icon" icon="schedule"></iron-icon></span>
                        </template>
                        <template is="dom-if" if="[[isModifiedAfter]]">
                            <span class="modified-after-out">[[localize('obs_val','obsolete value',language)]]<iron-icon class="modified-icon" icon="report-problem"></iron-icon></span>
                        </template>
                    </label>
                    <iron-input slot="input" bind-value="{{value}}">
                        <input readonly="" type="text" value="{{value::input}}" on-tap="_openPopupMenu">
                    </iron-input>
                    <paper-menu-button id="paper-menu-button" slot="suffix" horizontal-offset="[[listboxOffsetWidth]]">
                        <iron-icon icon="paper-dropdown-menu:arrow-drop-down" slot="dropdown-trigger"></iron-icon>
                        <paper-listbox id="dropdown-listbox" slot="dropdown-content" selected="{{selected}}">
                            <paper-item>[[localize('auc','Aucun',language)]]</paper-item>
                            <template is="dom-repeat" items="[[options]]">
                                <paper-item>[[item]]</paper-item>
                            </template>
                        </paper-listbox>
                    </paper-menu-button>
                </paper-input-container>
            </template>
            <template is="dom-if" if="[[dataSource]]">
                <vaadin-combo-box filtered-items="[[items]]" item-label-path="name" item-value-path="id" on-filter-changed="_filterChanged" label="[[_label(label)]]" value="{{value}}"></vaadin-combo-box>
            </template>
            <dynamic-link i18n="[[i18n]]" language="[[language]]" resources="[[resources]]" linkables="[[linkables]]" represented-object="[[label]]"></dynamic-link>
        </template>
`;
  }

  static get is() {
    return 'dynamic-popup-menu'
  }

  static get properties() {
    return {
      wasModified: {
        type: Boolean
      },
      isModifiedAfter: {
        type: Boolean
      },
      readOnly: {
        type: Boolean,
        value: false
      },
      lastModified: {
        type: String
      },
      label: {
        type: String
      },
      value: {
        type: String,
        notify: true,
        observer: '_valueChanged'
      },
      selected: {
        type: Number,
        observer: '_selectedChanged'
      },
      options: {
        type: Array
      },
      dataSource: {
        type: Object,
        value: null
      },
      width: {
        type: Number,
        value: 48,
        observer: '_widthChanged'
      },
      listboxOffsetWidth: {
        type: Number,
        value: -100
      },
      items: {
        type: Array,
        value: function () {
          return []
        }
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
    if (!this.offsetWidth) {
      return
    }
    this.set('listboxOffsetWidth', Math.min(-100, -this.offsetWidth + 16))
    if (this.width && this.$['dropdown-listbox']) {
      this.$['dropdown-listbox'].style.width = '' + (this.offsetWidth - 16) + 'px'
    }
  }

  _widthChanged(width) {
    this.updateStyles({'--dynamic-field-width': width, '--dynamic-field-width-percent': '' + width + '%'})
    if (this.$['dropdown-listbox']) {
      this.$['dropdown-listbox'].updateStyles({'--dynamic-field-width-percent': '' + width + '%'})
    }
  }

  _selectedChanged(selected) {
    if (this.readOnly) {
      return
    }
    this.set('value', this.options[selected - 1] || null)
  }

  _openPopupMenu() {
    if (this.readOnly) {
      return
    }
    this.shadowRoot.querySelector('#paper-menu-button').open()
  }

  _valueChanged(value) {
    value && this.dataSource && (!this.items || !this.items.find(i => i.id === value)) && this.dataSource.get(this.value).then(res => {
      if (res) {
        this.set('items', [res].concat(this.items || []))
        this.set('value', value)
      }
    })
    this.dispatchEvent(new CustomEvent('field-changed', {detail: {context: this.context, value: value}}))
  }

  _filterChanged(e) {
    const text = e.detail.value
    this.dataSource && this.dataSource.filter(text).then(items => this.value ? this.dataSource.get(this.value).then(res => res ? [res].concat(items) : items) : items).then(items => this.set('items', items))
  }

  _label(label) {
    return label || "\u00a0"
  }
}

customElements.define(DynamicPopupMenu.is, DynamicPopupMenu)