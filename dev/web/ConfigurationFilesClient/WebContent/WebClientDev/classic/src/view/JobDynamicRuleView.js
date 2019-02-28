Ext.define('ConfigurationFilesClient.view.JobDynamicRuleView', {
    extend: 'Ext.panel.Panel',
    xtype: 'job-dynamic-rule-view',
    layout: {
        type: 'hbox',
        align: 'stretch',
        pack: 'start'
    },
    controller: 'Job-dynamic-rule-view-controller',
    viewModel: 'job-dynamic-rule-view',
    //forceFit: true,

    onBoxReady: function () {
        var me = this;
        var gridPanel = me.down('gridpanel');

        var isAdmin = AuthorizationProvider.canAct('manage-jobs');
        var applyQueryBtn = me.down('query-builder').el.query('button[name=apply-button-query-builder]')[0];
        applyQueryBtn.addEventListener('click', function () {
            me.getController().searchInstances(me);
        }, me);
        if(!isAdmin){
            var AllButtons = me.down('query-builder').el.query('button').concat(me.down('query-builder').el.query('[type = radio]'));
            for(indx in AllButtons){
                AllButtons[indx].disabled = true;
            }
        }
        var displayProjection = MetadataClassService.getProjectionWithAttributesDefinitions('BCAPI:CFM.CFMNEScriptMapping', 'Display');
        var columns = _.map(displayProjection.AttributeRef, function (column) {
            var resCol = { text: column.label, dataIndex: column.name, tooltipFormatFn: me.getToolTip };
            switch (column.type) {
                case 'string':
                    resCol.filter = { type: 'string' };
                    break;
                case 'dateTime':
                    resCol.filter = { type: 'date' };
                    resCol.xtype = 'datecolumn';
                    resCol.format = 'd/m/Y H:i';
                    resCol.tooltipFormatFn = me.gridTooltipFormatFn;
                    break;
            }
            return resCol;
        });

        gridPanel.reconfigure(null, columns);
    },
    initComponent: function () {
        var me = this;
        var searchProjection = MetadataClassService.getProjectionWithAttributesDefinitions('BCAPI:CFM.CFMNEScriptMapping', 'Criteria');
        var entFilters = _.map(searchProjection.AttributeRef, function (attr) {
            return { id: 'CONFIG|' + attr.name, label: attr.label, input: "text", validation: { allow_empty_value: false } };
        });
        var controller = me.getController();
        var operators = controller.getOperators();

        me.items = [
            {
                xtype: 'container',
                flex: 1,
                autoScroll: true,
                scrollable: 'y',
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'start'
                },

                items: [
                    {
                        xtype: 'displayfield',
                        fieldCls: 'jobsLabelStyle',
                        bind: {
                            value: '{resources.ConfigurationFilesClient.JobsView.JobDynamicRuleView.DefineCriteria}'
                        }
                    },
                    {
                        xtype: 'query-builder',
                        //cls:'query-builder-jobs',
                        ui: 'query-builder-white',
                        watermark: 'Select criteria',
                        attributes: entFilters,
                        operators: operators,
                        applyFilterText:'Run Preview',
                    }
                ]
            },

            {
                xtype: 'container',
                flex: 2,
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'start'
                },
                items: [{
                    xtype: 'displayfield',
                    flex: 0.5,
                    fieldCls: 'jobsLabelStyle',
                    bind: {
                        value: '{resources.ConfigurationFilesClient.JobsView.JobDynamicRuleView.Preview}'
                    }
                },
                {
                    xtype: 'gridpanel',
                    name:'gridpanelDynamicRule',
                    cls:'grid-cls',
                    //selModel: Ext.create('Ext.selection.CheckboxModel', {}),
                    dataIndex: 'ObjectId',
                    layout: 'fit',
                    plugins: ['gridfilters', 'tooltips'],
                    flex: 4,
                    autoScroll: true,
                    scrollable: 'y',
                    forceFit: true,
                    bind: {
                        store: '{network_elements_filtered_store}'
                    }
                }
                ]
            }
        ],
            me.callParent(arguments);

    }

});