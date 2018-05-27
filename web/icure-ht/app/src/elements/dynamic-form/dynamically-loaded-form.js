import '../../icd-styles.js';
import './dynamic-form.js';
class DynamicallyLoadedForm extends Polymer.TkLocalizerMixin(Polymer.mixinBehaviors([], Polymer.Element)) {
  static get template() {
    return Polymer.html`
        <style include="icd-styles">
            .form-title-bar-btn {
                height: 20px;
                width: 20px;
                padding: 2px;
            }

            .link .ICD-10 span {
                content: '';
                display: inline-block;
                height: 6px;
                width: 6px;
                border-radius: 3px;
                margin-right: 3px;
                margin-bottom: 1px;
            }

            paper-listbox {
                min-width: 200px;
            }

            paper-menu-button {
                padding: 0;
            }
        </style>
        <dynamic-form id="dynamic-form" api="[[api]]" user="[[user]]" language="[[language]]" resources="[[resources]]" template="[[form.template.layout]]" data-provider="[[dataProvider]]" i18n="[[i18n]]" data-map="[[dataMap]]" title="[[form.template.name]]" read-only="[[_isNotInCurrentContact(currentContact, contact)]]" show-title="true" health-elements="[[healthElements]]">
            <div slot="titlebar">
                <paper-icon-button class="form-title-bar-btn" icon="delete" on-tap="deleteForm"></paper-icon-button>
                <paper-menu-button horizontal-align="right" dynamic-align="true">
                    <paper-icon-button class="form-title-bar-btn" icon="link" slot="dropdown-trigger" alt="menu"></paper-icon-button>
                    <paper-listbox slot="dropdown-content">
                        <template is="dom-repeat" items="[[healthElements]]" as="he">
                            <template is="dom-if" if="[[he.id]]">
                                <paper-item id="[[he.id]]" class="link" on-tap="linkForm"><label class\$="ICD-10 [[he.colour]]"><span></span></label>[[he.descr]]</paper-item>
                            </template>
                            <template is="dom-if" if="[[!he.id]]">
                                <paper-item id="[[he.idService]]" class="link" on-tap="linkForm"><label class\$="ICD-10 [[he.colour]]"><span></span></label>[[he.descr]]</paper-item>
                            </template>
                        </template>
                    </paper-listbox>
                </paper-menu-button>
            </div>
        </dynamic-form>
`;
  }

  static get is() {
    return 'dynamically-loaded-form'
  }

  static get properties() {
    return {
      api: {
        type: Object
      },
      user: {
        type: Object
      },
      patient: {
        type: Object,
        value: null
      },
      contact: {
        type: Object,
        value: null
      },
      contacts: {
        type: Array,
        value: []
      },
      servicesMap: {
        type: Object,
        value: {}
      },
      healthElements: {
        type: Array,
        value: function () {
          return []
        }
      },
      currentContact: {
        type: Object,
        value: null
      },
      formId: {
        type: String,
        observer: '_formIdChanged'
      },
      form: {
        type: Object,
        value: null
      },
      dataProvider: {
        type: Object,
        value: null
      },
      dataMap: {
        type: Object,
        value: null
      },
      layoutInfoPerLabel: {
        type: Object,
        value: function () {
          return {}
        }

      }
    }
  }

  static get observers() {
    return ["_prepareDataProvider(contacts.*,servicesMap.*,form,patient,user)"]
  }

  constructor() {
    super()
  }

  detached() {
    this.flushSave()
  }

  _isNotInCurrentContact(currentContact, contact) {
    return currentContact === null || contact !== currentContact
  }

  _prepareDataProvider() {
    if (this.contacts && this.form && this.user && this.patient && this.servicesMap) {
      this.set('dataProvider', this.getDataProvider(this.form, ''))
      this.set('dataMap', _.fromPairs(this.form.template.layout ? _.flatten(_.flatten(this.form.template.layout.sections.map(s => s.formColumns)).map(c => c.formDataList)).map(f => [f.name, 1]) : _.flatten(this.contacts.map(c => {
        const sc = c.subContacts.find(sc => sc.formId === this.form.id)
        return sc ? c.services.filter(s => sc.services.map(s => s.serviceId).includes(s.id)).map(s => [s.label, s]) : []
      }))))
      if (!this.form.template.layout) {
        this.set('form.template.layout', {
          sections: [{
            formColumns: [{
              formDataList: _.compact(Object.values(this.dataMap).map((s, idx) => {
                const c = this.localizedContent(s, this.language)
                return c ? {
                  name: s.label,
                  label: s.label,
                  editor: {
                    key: c.numberValue || c.numberValue === 0 ? 'NumberEditor' : c.measureValue ? 'MeasureEditor' : "StringEditor",
                    left: 0,
                    width: 100,
                    top: idx * 20,
                    multiline: true
                  }
                } : null
              }))
            }]
          }]
        })
      } else {
        this.set('layoutInfoPerLabel', (this.form.template.layout.sections && _.flatMap(this.form.template.layout.sections, s => s.formColumns && _.flatMap(s.formColumns, c => c.formDataList || []) || []) || []).reduce((acc, fli) => {
          acc[fli.name] = fli
          return acc
        }, {}))
      }
      this.set('currentContact', this.contacts.find(c => !c.closingDate) || null)
    }
  }

  scheduleSave(ctc) {
    if (!ctc) {
      return
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    this.saveAction = () => {
      this.dispatchEvent(new CustomEvent('must-save-contact', {detail: ctc, bubbles: true, composed: true})) //Must be fired before the end of the save otherwise the element won't exist anymore and the event will not bubble up
    }
    this.saveTimeout = setTimeout(this.saveAction, 10000)
  }

  flushSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveAction()

      this.saveTimeout = undefined
      this.saveAction = undefined
    }
  }

  _timeFormat(date) {
    return date ? this.api.moment(date).format(date > 99991231 ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY') : ''
  }

  getDataProvider(form, rootPath) {
    const initWrapper = (label, init) => svc => {
      const li = this.layoutInfoPerLabel[label]
      if (li) {
        li.tags && li.tags.forEach(tag => {
          const exTag = svc.tags.find(t => t.type === tag.type)
          if (exTag) {
            exTag.code = tag.code
            if (exTag.id) {
              exTag.id = tag.type + '|' + tag.code + "|" + (exTag.id.split('|')[2] || '1')
            }
          } else {
            svc.tags = (svc.tags || []).concat([tag])
          }
        })
        li.codes && li.codes.forEach(code => {
          const exCode = svc.codes.find(c => c.type === code.type && c.code === code.code)
          if (!exCode) {
            svc.codes = (svc.codes || []).concat([code])
          }
        })
        if (li.defaultStatus || li.defaultStatus === 0) {
          svc.status = li.defaultStatus
        }
      }
      return init && init(svc) || svc
    }

    const self = {
      servicesMap: {},
      services: label => {
        if (label && self.servicesMap[label]) {
          return self.servicesMap[label]
        }
        return label ? self.servicesMap[label] = this.servicesInForm(form.id, label) : this.servicesInForm(form.id)
      },
      servicesInHierarchy: label => {
        return _.concat(self.services(label), _.flatMap(form.children, sf => this.getDataProvider(sf, (rootPath.length ? rootPath + '.' : '') + sf.descr + '.' + form.children.filter(sff => sff.descr === sf.descr).indexOf(sf)).servicesInHierarchy(label)))
      },
      dispatchService: svc => {
        if (!svc) {
          return null
        }
        delete self.servicesMap[svc.label]
        this.dispatchEvent(new CustomEvent('new-service', {
          detail: {
            ctc: this.currentContact,
            svc: svc,
            scs: this.currentContact.subContacts.filter(sc => sc.formId === form.id)
          }, composed: true
        }))

        return svc
      },
      promoteOrCreateService: (label, formId, poaId, heId, init) => {
        const s = self.getServiceInContact(label)
        if (!this.currentContact) {
          return s && s.svc
        }
        return s && s.svc && (s.ctc.id === this.currentContact.id ? initWrapper(label, init)(s.svc) : self.dispatchService(this.promoteServiceInCurrentContact(s.svc, formId, poaId, heId, initWrapper(label, init)))) || self.dispatchService(this.createService(label, formId, poaId, heId, null, initWrapper(label, init)))
      },
      getOrCreateContent: (svc, lng) => svc && (svc.content && svc.content[lng] || ((svc.content || (svc.content = {}))[lng] = {})),
      getServicesLineForContact: label => {
        const sss = self.services(label)
        return sss && (sss.find(svcs => svcs.find(ss => ss.ctc.id === this.contact.id)) || sss[0])
      },
      getServiceInContact: label => {
        const ssLine = self.getServicesLineForContact(label)
        return ssLine && ssLine.find(ss => !this.api.after(ss.ctc.created, this.contact.created))
      },
      wasModified: label => {
        const s = self.getServiceInContact(label)
        return s && (this.api.before(s.ctc.openingDate, this.contact.openingDate) || this.api.before(s.ctc.created, this.contact.created))
      },
      isModifiedAfter: label => {
        const s = self.getServicesLineForContact(label)
        return s && s[0] !== self.getServiceInContact(label)
      },
      latestModification: label => {
        const s = self.getServicesLineForContact(label)
        return s && this._timeFormat(s[0].ctc.openingDate)
      },
      getValueContainers: label => {
        const c = _.compact(self.services(label).map(line => line && line.find(ss => !this.api.after(ss.ctc.created, this.contact.created))).map(s => s && s.svc && !s.svc.endOfLife && s.svc)).map(_.cloneDeep) //Never provide the real objects so that we can compare them later on
        return c
      },
      setValueContainers: (label, containers) => {
        if (!this.currentContact) {
          return
        }
        let currentValueContainers = self.getValueContainers(label)
        if (_.isEqual(currentValueContainers, containers)) {
          return
        }
        const isModified = containers.map(service => {
          let svc = this.currentContact.services.find(s => s.id === service.id)
          if (svc) {
            _.pull(currentValueContainers, currentValueContainers.find(s => s.id === service.id))
            if (!_.isEqual(svc.content, service.content) || svc.index !== service.index || svc.endOfLife) {
              _.extend(svc.content, service.content)
              svc.index = service.index
              delete svc.endOfLife

              return true
            }
          } else {
            const prevSvc = currentValueContainers.find(s => s.id === service.id)
            if (prevSvc) {
              _.pull(currentValueContainers, currentValueContainers.find(s => s.id === service.id))
            }
            if (!prevSvc || !_.isEqual(prevSvc.content, service.content)) {
              self.dispatchService(_.extend(this.createService(label, form.id, null, null, service.id, initWrapper(label)), {
                index: service.index,
                content: service.content,
                codes: service.codes
              }))
              return true
            }
          }
          return false
        }).find(x => x)
        currentValueContainers.forEach(service => {
          let svc = this.currentContact.services.find(s => s.id === service.id)
          if (svc) {
            svc.endOfLife = +new Date() * 1000
          } else {
            self.dispatchService(_.extend(this.createService(label, form.id, null, null, service.id, initWrapper(label)), {endOfLife: +new Date() * 1000}))
          }
        })
        if (isModified || currentValueContainers.length) {
          this.scheduleSave(this.currentContact)
        }
      },
      getStringValue: (label, latest) => {
        const s = latest ? self.getServicesLineForContact(label)[0] : self.getServiceInContact(label)
        const c = s && s.svc && !s.svc.endOfLife && this.localizedContent(s.svc, this.language)
        return c && c.stringValue
      },
      getNumberValue: (label, latest) => {
        const s = latest ? self.getServicesLineForContact(label)[0] : self.getServiceInContact(label)
        const c = s && s.svc && !s.svc.endOfLife && this.localizedContent(s.svc, this.language)
        return c && c.numberValue
      },
      getMeasureValue: (label, latest) => {
        const s = latest ? self.getServicesLineForContact(label)[0] : self.getServiceInContact(label)
        const c = s && s.svc && !s.svc.endOfLife && this.localizedContent(s.svc, this.language)
        return c && c.measureValue
      },
      getDateValue: (label, latest) => {
        const s = latest ? self.getServicesLineForContact(label)[0] : self.getServiceInContact(label)
        const c = s && s.svc && !s.svc.endOfLife && this.localizedContent(s.svc, this.language)
        return c && c.instantValue
      },
      getBooleanValue: (label, latest) => {
        const s = latest ? self.getServicesLineForContact(label)[0] : self.getServiceInContact(label)
        const c = s && s.svc && !s.svc.endOfLife && this.localizedContent(s.svc, this.language)
        return c && c.booleanValue
      },
      getValueDateOfValue: (label, latest) => {
        const s = latest ? self.getServicesLineForContact(label)[0] : self.getServiceInContact(label)
        return s && s.svc && !s.svc.endOfLife && s.svc.valueDate
      },
      setStringValue: function (label, value) {
        if (self.getStringValue(label) === value) {
          return
        }
        self.promoteOrCreateService(label, form.id, null, null, svc => {
          let c = self.getOrCreateContent(svc, this.language)
          if (c && c.stringValue !== value) {
            c.stringValue = value
            this.scheduleSave(this.currentContact)
          }
          return svc
        })
      }.bind(this),
      setNumberValue: function (label, value) {
        if (self.getNumberValue(label) === parseFloat(value)) {
          return
        }
        self.promoteOrCreateService(label, form.id, null, null, svc => {
          let c = self.getOrCreateContent(svc, this.language)
          if (c && c.numberValue !== value) {
            c.numberValue = value
            this.scheduleSave(this.currentContact)
          }
          return svc
        })
      }.bind(this),
      setMeasureValue: function (label, value) {
        const currentValue = self.getMeasureValue(label)
        if (currentValue && (!currentValue.value && !value.value || currentValue.value === value.value) && (!currentValue.unit && !value.unit || currentValue.unit === value.unit)) {
          return
        }
        self.promoteOrCreateService(label, form.id, null, null, svc => {
          let c = self.getOrCreateContent(svc, this.language)
          if (c && c.measureValue !== value) {
            c.measureValue = value
            this.scheduleSave(this.currentContact)
          }
          return svc
        })
      }.bind(this),
      setDateValue: function (label, value) {
        if (self.getDateValue(label) === value) {
          return
        }
        self.promoteOrCreateService(label, form.id, null, null, svc => {
          let c = self.getOrCreateContent(svc, this.language)
          if (c && c.instantValue !== value) {
            c.instantValue = value
            this.scheduleSave(this.currentContact)
          }
          return svc
        })
      }.bind(this),
      setBooleanValue: function (label, value) {
        if (self.getBooleanValue(label) === value) {
          return
        }
        self.promoteOrCreateService(label, form.id, null, null, svc => {
          let c = self.getOrCreateContent(svc, this.language)
          if (c && c.booleanValue !== value) {
            c.booleanValue = value
            this.scheduleSave(this.currentContact)
          }
          return svc
        })
      }.bind(this),
      setValueDateOfValue: function (label, value, setBooleanValue) {
        if (self.getValueDateOfValue(label) === value) {
          return
        }
        self.promoteOrCreateService(label, form.id, null, null, svc => {
          if (!svc) {
            return
          }
          if (svc.valueDate !== value) {
            svc.valueDate = value
            if (setBooleanValue) {
              let c = self.getOrCreateContent(svc, this.language)
              if (c && c.booleanValue !== value) {
                c.booleanValue = value
              }
            }
            this.scheduleSave(this.currentContact)
          } else if (setBooleanValue) {
            self.setBooleanValue(!!value)
          }
          return svc
        })
      }.bind(this),
      getSubForms: function (key) {
        return (form.children || []).filter(f => f.descr === key).map((subForm, idx) => {
          return {
            dataMap: _.fromPairs(_.flatten(_.flatten(subForm.template.layout.sections.map(s => s.formColumns)).map(c => c.formDataList)).map(f => [f.name, 1])),
            dataProvider: this.getDataProvider(subForm, (rootPath.length ? rootPath + '.' : '') + key + '.' + idx),
            template: subForm.template.layout
          }
        })
      }.bind(this),
      editForm: function () {
        this.dispatchEvent(new CustomEvent('edit-form', {detail: form, composed: true}))
      }.bind(this),
      deleteForm: function () {
        if (!this.currentContact) {
          return
        }
        this.flushSave()

        const id = form.id
        const subContacts = this.currentContact.subContacts.filter(sc => sc.formId === id)
        _.pullAll(this.currentContact.subContacts, subContacts)

        //Get all services in the formId
        this.servicesInForm(id).forEach(sl => {
          if (sl.length >= 1 && sl[0].ctc === this.currentContact) {
            sl[0].svc.content = {}
            sl[0].svc.endOfLife = +new Date() * 1000
          } else {
            (this.currentContact.services || (this.currentContact.services = [])).push(self.dispatchService(_.extend(_.cloneDeep(sl[0].svc), {
              content: {},
              endOfLife: +new Date() * 1000
            })))
          }
        })

        this.api.form().modifyForm(_.extend(form, {deletionDate: +new Date() * 1000})).then(f => {
          this.dispatchEvent(new CustomEvent('form-deleted', {detail: f, composed: true}))
        })
      }.bind(this),
      getId: () => form.id,
      deleteSubForm: (key, id) => {
        if (!this.currentContact) {
          return
        }
        this.flushSave()

        const ff = form.children.find(a => a.id === id)

        _.pull(form.children, ff)
        const subContacts = this.currentContact.subContacts.filter(sc => sc.formId === id)
        _.pullAll(this.currentContact.subContacts, subContacts)

        //Get all services in the formId
        this.servicesInForm(id).forEach(sl => {
          if (sl.length >= 1 && sl[0].ctc === this.currentContact) {
            sl[0].svc.content = {}
            sl[0].svc.endOfLife = +new Date() * 1000
          } else {
            (this.currentContact.services || (this.currentContact.services = [])).push(self.dispatchService(_.extend(_.cloneDeep(sl[0].svc), {
              content: {},
              endOfLife: +new Date() * 1000
            })))
          }
        })

        this.api.form().modifyForm(_.extend(ff, {deletionDate: +new Date() * 1000})).then(f => {
          this.$['dynamic-form'].notify((rootPath.length ? rootPath + '.' : '') + key + '.*')
          this.scheduleSave(this.currentContact)
        })
      },
      addSubForm: (key, guid) => {
        if (!this.currentContact) {
          return
        }
        this.flushSave()
        this.api.hcparty().getCurrentHealthcareParty().then(hcp => this.api.form().getFormTemplatesByGuid(guid, hcp.specialityCodes[0] && hcp.specialityCodes[0].code || 'deptgeneralpractice')).then(formTemplates => {
          if (formTemplates[0] && formTemplates[0]) {
            //Create a new form and link it to the currentContact
            this.api.form().newInstance(this.user, this.patient, {
              contactId: this.currentContact.id,
              descr: key,
              formTemplateId: formTemplates[0].id,
              parent: form.id
            }).then(f => this.api.form().createForm(f)).then(f => {
              f.template = formTemplates[0]; //Important
              (form.children || (form.children = [])).push(f)
              this.currentContact.subContacts.push({formId: f.id, descr: key, services: []})

              this.$['dynamic-form'].notify((rootPath.length ? rootPath + '.' : '') + key + '.*')
              this.scheduleSave(this.currentContact)
            })
          }
        })
      },
      filter: (data, text) => {
        return data.source === "codes" && data.types.length && text && text.length > 1 ? Promise.all(data.types.map(ct => {
          const typeLng = this.api.code().languageForType(ct.type, this.language)
          const words = text.split(/\s+/)
          return this.api.code().findPaginatedCodesByLabel('be', ct.type, typeLng, words[0], null, 200).then(results => results.rows.filter(c => c.label[typeLng] && words.every(w => c.label[typeLng].includes(w))).map(code => ({
            id: code.id, stringValue: code.label[typeLng],
            codes: [code].concat(code.links && code.links.map(c => ({id: c, type: c.split('|')[0], code: c.split('|')[1], version: c.split('|')[2]})) || [])
          })))
        })).then(responses => _.flatMap(responses)) : Promise.resolve([])
      }
    }
    return self
  }

  _formIdChanged(formId) {
    if (!formId) {
      return
    }

    const loadForms = function (templates, forms, root) {
      const newFormTemplateIds = forms.map(f => f.formTemplateId).filter(id => id && !templates[id])
      return Promise.all(newFormTemplateIds.map(id => this.api.form().getFormTemplate(id))).then(fts => {
        fts.forEach(ft => {
          templates[ft.id] = ft
        })
        forms.forEach(f => f.template = f.formTemplateId ? templates[f.formTemplateId] : {layout: null, name: "Dynamic"})
      }).then(() => Promise.all(forms.map(f => this.api.form().getChildren(f.id, this.user.healthcarePartyId)))).then(children => {
        children.forEach((cs, idx) => {
          forms[idx].children = cs
          cs.forEach(c => forms[c.id] = cs)
        })
        return children.length ? loadForms(templates, _.flatten(children), root) : root
      })
    }.bind(this)
    this.api.form().getForm(formId).then(f => loadForms({}, [f], f)).then(form => this.set('form', form))
  }

  deleteForm() {
    this.dataProvider.deleteForm && this.dataProvider.deleteForm()
  }

  linkForm(e, target) {
    const he = this.healthElements.find(he => he.id === e.target.id || he.idService === e.target.idserviceToHealthElement)
    if (!he) {
      return
    }
    if (!he.id) {
      this.promoteServiceToHealthElement(he).then(he => {
        _.compact(this.dataProvider.servicesInHierarchy().map(svcLine => svcLine[0])) //Latest version of all services
          .forEach(svc => {
            this.promoteServiceInCurrentContact(svc.svc, this.form.id, null, he.id, null)
          })
        this.scheduleSave(this.currentContact)
      })
    } else {
      _.compact(this.dataProvider.servicesInHierarchy().map(svcLine => svcLine[0])) //Latest version of all services
        .forEach(svc => {
          this.promoteServiceInCurrentContact(svc.svc, this.form.id, null, he.id, null)
        })
      this.scheduleSave(this.currentContact)
    }
  }

  servicesInForm(formId, label) {
    const svcStructs = (label ? this.servicesMap[label] : _.flatten(Object.values(this.servicesMap))) || []
    return _.sortBy(_.uniqBy(svcStructs.filter(ss => (ss.scs || []).find(sc => sc.formId === formId)) //Extract all services which appear at some point in that form
        .map(ss => ss.svc.id)) //Get their ids
        .map(id => _.sortBy(svcStructs.filter(ss => ss.svc.id === id), ss => -ss.svc.modified)) //Sort them by modified for each id
        .filter(svcHistory => svcHistory.length) //Keep the ones with a history
      , svcs => -svcs[0].svc.modified) //Sort the lines of services by modification date
  }

  services(ctc, label) {
    return this.api && this.api.contact().services(ctc, label) || []
  }

  createService(label, formId, poaId, heId, serviceId, init) {
    if (!this.currentContact) {
      return null
    }
    const svc = this.api.contact().service().newInstance(this.user, serviceId ? {id: serviceId, label: label} : {label: label});
    (this.currentContact.services || (this.currentContact.services = [])).push(svc)

    let sc = this.currentContact.subContacts.find(sc => sc.formId === formId)
    if (!sc) {
      this.currentContact.subContacts.push(sc = {formId: formId, planOfActionId: poaId, healthElementId: heId, services: []})
    }
    const csc = this.currentContact.subContacts.find(csc => csc.services.indexOf(svc.id) >= 0)
    if (csc) {
      if (csc !== sc) {
        csc.splice(csc.services.indexOf(svc.id), 1)
        sc.services.push({serviceId: svc.id})
      }
    } else {
      sc.services.push({serviceId: svc.id})
    }
    return init && init(svc) || svc
  }

  promoteServiceToHealthElement(heSvc) {
    this.api.helement().serviceToHealthElement(this.user, this.patient, heSvc, this.language).then(he => {
      this.promoteServiceInCurrentContact(heSvc.svc, this.form.id, null, he.id, null)
      this.scheduleSave(this.currentContact)
      this.dispatchEvent(new CustomEvent('health-elements-change', {detail: {hes: [he]}, bubbles: true, composed: true}))
      return he
    })
  }

  promoteServiceInCurrentContact(svc, formId, poaId, heId, init) {
    return this.api.contact().promoteServiceInContact(this.currentContact, this.user, this.contacts, svc, formId, poaId, heId, init)
  }

  shortServiceDescription(svc, lng) {
    let rawDesc = this.api && this.api.contact().shortServiceDescription(svc, lng)
    return rawDesc && '' + rawDesc || ''
  }

  contentHasData(c) {
    return this.api && this.api.contact().contentHasData(c) || false
  }

  localize(e, lng) {
    return this.api && this.api.contact().localize(e, lng) || ""
  }

  localizedContent(svc, lng) {
    return this.api && svc && this.api.contact().localize(svc.content, lng) || {}
  }
}

customElements.define(DynamicallyLoadedForm.is, DynamicallyLoadedForm)