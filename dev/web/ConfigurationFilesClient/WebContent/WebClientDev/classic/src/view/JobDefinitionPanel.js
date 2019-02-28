Ext.define('ConfigurationFilesClient.view.JobDefinitionPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'job-definition-panel',

    ui: 'job-definition-panel-ui',

    viewModel: {
        type: 'job-definition-panel-view-model'
    },

    controller: 'job-definition-panel-view-controller',
    bind: {
        title: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.Title}'
    },

    layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    },

    defaults: {
        //    margin: '0 5 5 0'
    },
    onBoxReady: function () {
        var me = this;
        var vm = me.getViewModel();

        vm.bind('{isDynamicRule}', function (newValue, oldValue) {
            var me = this;
            if (newValue) {
                var cardContainer = me.down('container[name=SelectedNEsCardContainer]');
                var l = cardContainer.getLayout();
                l.setActiveItem('DynamicRule');
            }
        }, this);

        vm.bind('{isSelectInstances}', function (newValue, oldValue) {
            var me = this;
            if (newValue) {
                var cardContainer = me.down('container[name=SelectedNEsCardContainer]');
                var l = cardContainer.getLayout();
                l.setActiveItem('SelectInstances');
            }
        }, this);

        vm.bind('{NeCriteria}', function (newValue, oldValue) {
            if (newValue) {
                var me = this;
                var queryRules = me.up('job-details-container-view').getController().convertFilter(newValue);
                var query = me.down('query-builder');
                if (queryRules) {
                    query.setRules(queryRules);
                    if(oldValue == undefined){
                        me.up('job-details-view').getController().initCriteria();                        
                    }
                }
            }
        }, this);

    },

    items: [
        {
            xtype: 'displayfield',
            fieldCls: 'backupJobTitleCls',
            flex: 0.2,
            listeners: {
                afterrender: function (c) {
                    Ext.create('Ext.tip.ToolTip', {
                        target: c.getEl(),
                        viewModel: c.up('job-definition-panel').getViewModel(),
                        bind: {
                            html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.BackupJobTitle}',
                        }
                    });
                }
            },
            bind: {
                value: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.BackupJobTitle}'
            },
        },
        {
            xtype: 'container',
            flex: 0.5,
            minHeight: 60,

            layout: {
                type: 'hbox',
                align: 'stretch',
            },
            defaults: {
                margin: '1 5 1 0'
            },
            items: [
                {
                xtype: 'textfield',
                labelSeparator: '',
                labelAlign: 'top',
                //disabledCls:'jobsNameStyleDisabled',
                labelCls: 'jobsLabelStyle',
                ui: 'jobs-text-field-ui',
                //name: 'job-name-textfield',
                maxLength:150,
                enforceMaxLength :true,
                //regex:"^[a-zA-z0-9- ]+$",
                //invalidText :"Allowed characters are letters, digits, space and minus",
                listeners: {
                    afterrender: function (c) {
                        Ext.create('Ext.tip.ToolTip', {
                            target: c.labelEl,
                            viewModel: c.up('job-definition-panel').getViewModel(),
                            bind: {
                                html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.JobNameLabel}',
                            }
                        });
                    }
                },
                width: 350,
                maxHeight: 50,

                bind: {
                    //fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.JobNameLabel}',
                    fieldLabel: '{jobNameLabel}',
                    value: '{jobName}',
                    hidden: '{!isNameEditable}',
                    //cls:'{jobNameCls}'
                }
            },
            {
                xtype: 'textfield',
                labelSeparator: '',
                labelAlign: 'top',
                //disabledCls:'jobsNameStyleDisabled',
                labelCls: 'jobsLabelStyle',
                ui: 'jobs-text-field-ui-not-editable',
                //name: 'job-name-textfield',
                maxLength:150,
                enforceMaxLength :true,
                editable:false,
                //regex:"^[a-zA-z0-9- ]+$",
                //invalidText :"Allowed characters are letters, digits, space and minus",
                listeners: {
                    afterrender: function (c) {
                        Ext.create('Ext.tip.ToolTip', {
                            target: c.labelEl,
                            viewModel: c.up('job-definition-panel').getViewModel(),
                            bind: {
                                html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.JobNameLabel}',
                            }
                        });
                    },
                    change: function( comp, newValue, oldValue, eOpts){
                        //var me = this;
                        if(comp.tooltip){
                            comp.tooltip.destroy();
                        }
                        if(newValue != ""){
                            comp.tooltip = Ext.create('Ext.tip.ToolTip', {
                                target: comp.getEl(),                    
                                html: newValue                       
                            });
                        }                       
                    }
                },
                width: 350,
                maxHeight: 50,

                bind: {
                    //fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.JobNameLabel}',
                    fieldLabel: '{jobNameLabel}',
                    value: '{jobName}',
                    hidden: '{isNameEditable}',
                    //cls:'{jobNameCls}'
                }
            },
            {
                xtype: 'combo',
                labelSeparator: '',
                labelAlign: 'top',
                name: 'ConfigFileCombo',
                ui: 'jobs-text-field-ui',
                maxHeight: 50,
                listeners: {
                    afterrender: function (c) {
                        Ext.create('Ext.tip.ToolTip', {
                            target: c.labelEl,
                            viewModel: c.up('job-definition-panel').getViewModel(),
                            bind: {
                                html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.ConfigFileTypeLabel}',
                            }
                        });
                    },
                    change: function(ele, newValue, oldValue){
                        if(newValue && oldValue){
                            var definitionPanel = ele.up('job-definition-panel');
                            if(definitionPanel.getViewModel().get('isSelectInstances')){
                                var selectedNesGrid = definitionPanel.down('gridpanel[name=gridpanelSelectInstances]');
                                selectedNesGrid.getStore().removeAll();
                            }
                        }
                    }
                },
                labelCls: 'jobsLabelStyle',
                width: 350,
                bind: {
                    fieldLabel: '{configFileTypeLabel}',
                    value: '{configurationFileType}',
                    store: '{fileTypesStore}',
                    disabled: '{!isAdmin}'
                },
                editable: false,
                valueField: 'value',
                displayField: 'text',
                mode: 'local',
                queryMode: 'local'
            }
            ]
        },
        {
            xtype: 'textarea',
            flex: 0.5,
            //minHeight: 20,
            labelAlign: 'top',
            labelSeparator: '',
            name: 'job-description',
            listeners: {
                afterrender: function (c) {
                    Ext.create('Ext.tip.ToolTip', {
                        target: c.labelEl,
                        viewModel: c.up('job-definition-panel').getViewModel(),
                        bind: {
                            html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.DescriptionLabel}',
                        }
                    });
                },
                change: function( comp, newValue, oldValue, eOpts){
                    //var me = this;
                    if(comp.tooltip){
                        comp.tooltip.destroy();
                    }
                    if(newValue != ""){
                        comp.tooltip = Ext.create('Ext.tip.ToolTip', {
                            target: comp.getEl(),                    
                            html: newValue                       
                        });
                    }  
                }
            },
            Height: 50,
            labelCls: 'jobsLabelStyle',
            ui: 'jobs-text-field-description-ui',
            maxWidth: 710,
            bind: {
                fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.DescriptionLabel}',
                value: '{description}',
                editable: '{isAdmin}'
            }
        },
        {
            xtype: 'container',
            flex: 3,
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
            },
            bind: {
                // disabled: '{!isConfigurationFileTypeSelected}'
            },
            items: [{
                xtype: 'radiogroup',
                cls: 'selectNesRadio',
                disabledCls: 'selectNesRadioDisabled',
                labelAlign: 'top',
                //allowBlank: false,
                labelCls: 'jobsLabelStyle',
                columns: [150, 150],
                margin: '60 0 0 0',
                //checked: false,
                flex: 1,
                minHeight: 45,
                //cls: 'x-check-group-alt',
                //name: 'SelectedNEsRadio',
                bind: {
                    //value: '{SelectedNEsRadio}',
                    fieldLabel: '{selectedNesLabel}',
                    disabled: '{isRadioDisabled}',
                    //editable:'{isAdmin}'

                },
                items: [
                    { boxLabel: 'Dynamic Rule', inputValue: 'DynamicRule', bind: { value: '{isDynamicRule}' } },
                    { boxLabel: 'Select Instances', inputValue: 'SelectInstances', bind: { value: '{isSelectInstances}' } }
                ]
            },
            {
                xtype: 'container',

                bind: {
                    // disabled: '{!isConfigurationFileTypeSelected}'
                },
                name: 'SelectedNEsCardContainer',
                layout: 'card',
                flex: 5,
                items: [
                    {
                        xtype: 'panel',
                        itemId: 'emptyCard',
                    },
                    {
                        xtype: 'job-dynamic-rule-view',
                        itemId: 'DynamicRule',
                    },
                    {
                        xtype: 'job-select-instances-view',
                        itemId: 'SelectInstances',
                    }
                ]
            }]
        },



    ]
});