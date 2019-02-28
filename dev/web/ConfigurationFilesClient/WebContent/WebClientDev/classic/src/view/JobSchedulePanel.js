// Enums

const ScheduleTypeValues = Object.freeze({
    ONCE: 0,
    RECURRING: 1,
    DAYOFWEEK: 2
});

const ScheduleIntervalValues = Object.freeze({
    MINUTES: 0,
    HOURS: 1,
    DAYS: 2,
    WEEKS: 3,
    MONTHS: 4,
    YEARS: 5,
})

Ext.define('ConfigurationFilesClient.view.JobSchedulePanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'job-schedule-panel',

    requires: [
        // 'ExtCore.util.JCoreDateTimeRange',
        // 'ExtCore.ux.Dialog',
        'ExtCore.util.JCoreDateTimeRange',
        'ExtCore.ux.Dialog',
        'ExtCore.ux.datetime.DateTimeField'
    ],

    resources: LocalizationProvider.resources,

    viewModel: {
        type: 'jobschedulepanel'
    },

    layout: {
        type: 'vbox',
        //align: 'stretch',
        padding: 5
    },

    defaults: {
        hidden: true
    },

    bind: {
        title: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.Title}'
    },

    onBoxReady: function() {

    },

    initComponent: function() {
        var me = this;
        cardId = me.up('job-details-view').itemId
        me.items = [{
                    xtype: 'combobox',
                    name: 'scheduleType',
                    width: 200,
                    labelAlign: "top",
                    disabledCls: 'removeDisableStyle',
                    labelSeparator: ' ',
                    editable: false,
                    hidden: false,
                    value: ScheduleTypeValues.RECURRING,
                    bind: {
                        fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleType}',
                        value: '{ScheduleType}',
                        disabled: '{!isAdmin}'
                    },
                    store: new Ext.data.SimpleStore({
                        data: [
                            [ScheduleTypeValues.ONCE, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleTypeOnce')],
                            [ScheduleTypeValues.RECURRING, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleTypeRecurring')],
                            [ScheduleTypeValues.DAYOFWEEK, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleTypeDayOfWeek')]
                        ],
                        fields: ['value', 'text']
                    }),
                    valueField: 'value',
                    displayField: 'text',
                    mode: 'local',
                    queryMode: 'local',
                    forceSelection: true,
                    editable: false,
                },
                {
                    xtype: 'panel',
                    layout: {
                        type: 'hbox'
                    },

                    bind: {
                        hidden: '{!recurringModeActive}',
                    },

                    items: [{
                            xtype: 'numberfield',
                            name: 'everyField',
                            disabledCls: 'removeDisableStyle',
                            minValue: 1,
                            maxValue: 100,
                            margin: '0,20,0,0',
                            width: 100,
                            labelAlign: "top",
                            labelSeparator: ' ',
                            bind: {
                                fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.Every}',
                                value: '{recurringEveryValue}',
                                disabled: '{!isAdmin}'
                            }
                        },
                        {
                            margin: '0 0 0 20',
                            xtype: 'combobox',
                            name: 'intervalField',
                            disabledCls: 'removeDisableStyle',
                            labelAlign: "top",
                            labelSeparator: ' ',
                            store: new Ext.data.SimpleStore({
                                data: [
                                    [ScheduleIntervalValues.MINUTES, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleIntervalMinutes')],
                                    [ScheduleIntervalValues.HOURS, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleIntervalHours')],
                                    [ScheduleIntervalValues.DAYS, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleIntervalDays')],
                                    [ScheduleIntervalValues.WEEKS, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleIntervalWeeks')],
                                    [ScheduleIntervalValues.MONTHS, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleIntervalMonths')],
                                   // [ScheduleIntervalValues.YEARS, LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ScheduleIntervalYears')]
                                ],
                                name: 'jobScheduleIntervalComboboxStore',
                                fields: ['value', 'text']
                            }),
                            valueField: 'value',
                            displayField: 'text',
                            mode: 'local',
                            queryMode: 'local',
                            forceSelection: true,
                            editable: false,
                            bind: {
                                fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.Interval}',
                                value: '{recurringIntervalValue}',
                                disabled: '{!isAdmin}'
                            }
                        }
                    ]
                },

                {
                    xtype: 'datetimefield',
                    name: 'startTimeFieldOnce',
                    //ui: 'timeresolution-text',
                    disabledCls: 'removeDisableStyle',
                    labelAlign: "top",
                    labelSeparator: ' ',
                    //format: 'd-m-Y g:i',
                    //emptyText: 'dd/mm/yy, --:--',
                    submitEmptyText: false,

                    width: 200,
                    invalidText: LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.InvalidDateTimeValue'),
                    formatText: LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ExpectedDateTimeValue'),
                    bind: {
                        fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.DateTime}',
                        hidden: '{!onceModeActive}',
                        value: '{onceDateTimeValue}',
                        validationField:'{onceDateTimeValueIsValid}',
                        disabled: '{!isAdmin}'
                    }
                },

                {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        pack: 'start'
                    },

                    bind: {
                        hidden: '{!dayOfWeekModeActive}',
                    },

                    items: [{
                            xtype: 'displayfield',
                            fieldCls: 'jobsLabelStyle',
                            disabledCls: 'removeDisableStyle',
                            readonly: true,
                            focusable: true,
                            margin: '8 0 4 0',
                            baseBodyCls: 'displayfield-base-body',

                            bind: {
                                value: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.Weekdays}',
                            },
                        },

                        {
                            xtype: 'container',
                            name: 'weekdaysbuttons',
                            disabledCls: 'removeDisableStyle',
                            layout: {
                                type: 'hbox',
                                //align: 'stretch',
                            },

                            defaults: {
                                enableToggle: true
                            },

                            items: [{
                                    xtype: 'button',
                                    ui: 'weekday-button',
                                    disabledCls: 'removeDisableStyle',
                                    textAlign: 'left',
                                    bind: { text: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.MondayShort}', pressed: '{dayOfWeekMondaySelected}' },
                                    plugins: {
                                        ptype: 'authorization',
                                        actions: [
                                            'manage-jobs'
                                        ],
                                        effect: 'disable'
                                    }
                                },
                                {
                                    xtype: 'button',
                                    ui: 'weekday-button',
                                    disabledCls: 'removeDisableStyle',
                                    textAlign: 'left',
                                    plugins: {
                                        ptype: 'authorization',
                                        actions: [
                                            'manage-jobs'
                                        ],
                                        effect: 'disable'
                                    },
                                    bind: { text: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.TuesdayShort}', pressed: '{dayOfWeekTuesdaySelected}' }

                                },
                                {
                                    xtype: 'button',
                                    ui: 'weekday-button',
                                    disabledCls: 'removeDisableStyle',
                                    textAlign: 'left',
                                    plugins: {
                                        ptype: 'authorization',
                                        actions: [
                                            'manage-jobs'
                                        ],
                                        effect: 'disable'
                                    },
                                    bind: { text: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.WednesdayShort}', pressed: '{dayOfWeekWednesdaySelected}' }
                                },
                                {
                                    xtype: 'button',
                                    ui: 'weekday-button',
                                    disabledCls: 'removeDisableStyle',
                                    textAlign: 'left',
                                    plugins: {
                                        ptype: 'authorization',
                                        actions: [
                                            'manage-jobs'
                                        ],
                                        effect: 'disable'
                                    },
                                    bind: { text: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.ThursdayShort}', pressed: '{dayOfWeekThursdaySelected}' }
                                },
                                {
                                    xtype: 'button',
                                    ui: 'weekday-button',
                                    textAlign: 'left',
                                    disabledCls: 'removeDisableStyle',
                                    plugins: {
                                        ptype: 'authorization',
                                        actions: [
                                            'manage-jobs'
                                        ],
                                        effect: 'disable'
                                    },
                                    bind: { text: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.FridayShort}', pressed: '{dayOfWeekFridaySelected}' }
                                },
                                {
                                    xtype: 'button',
                                    ui: 'weekday-button',
                                    disabledCls: 'removeDisableStyle',
                                    textAlign: 'left',
                                    plugins: {
                                        ptype: 'authorization',
                                        actions: [
                                            'manage-jobs'
                                        ],
                                        effect: 'disable'
                                    },
                                    bind: {
                                        text: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.SaturdayShort}',
                                        pressed: '{dayOfWeekSaturdaySelected}'
                                    },
                                },
                                {
                                    xtype: 'button',
                                    ui: 'weekday-button',
                                    disabledCls: 'removeDisableStyle',
                                    textAlign: 'left',
                                    plugins: {
                                        ptype: 'authorization',
                                        actions: [
                                            'manage-jobs'
                                        ],
                                        effect: 'disable'
                                    },
                                    bind: { text: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.SundayShort}', pressed: '{dayOfWeekSundaySelected}' }
                                },

                            ]
                        },

                    ]
                },

                {
                    xtype: 'datetimefield',
                    //ui: 'timeresolution-text',
                    name:'startTimeField',
                    disabledCls: 'removeDisableStyle',
                    labelAlign: "top",
                    labelSeparator: ' ',
                    width: 200,
                    margin: '20 0 10 0',
                    //format: 'd-m-Y g:i',
                    //emptyText: 'dd/mm/yy, --:--',
                    submitEmptyText: false,
                    invalidText: LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.InvalidDateTimeValue'),
                    formatText: LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ExpectedDateTimeValue'),
                    bind: {
                        fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.StartDateTime}',
                        hidden: '{!recurringOrDayOfWeekModeActive}',
                        value: '{startDateTimeValue}',
                        disabled: '{!isAdmin}'
                            //invalidText: '{InvalidDateTimeValue}',
                    }
                },
                {
                    xtype: 'radiofield',
                    name: 'endRadio'+cardId,
                    disabledCls: 'removeDisableStyle',
                    labelAlign: "top",
                    labelSeparator: ' ',
                    cls: 'endRadioButton',
                    //disabled :'{!isAdmin}',

                    bind: {
                        fieldLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.End}',
                        boxLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.NoEndDate}',
                        hidden: '{!recurringOrDayOfWeekModeActive}',
                        value: '{endRadioGroupValue}',
                        disabled: '{!isAdmin}'
                    }
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',

                    bind: {
                        hidden: '{!recurringOrDayOfWeekModeActive}',
                    },

                    items: [{
                        xtype: 'radio',
                        name: 'endRadio'+cardId,
                        cls: 'endRadioButton',
                        disabledCls: 'removeDisableStyle',
                        bind: {
                            boxLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.EndAfter}',
                            value: '{endRadioEndAfter}',
                            disabled: '{!isAdmin}'
                        },
                    }, {
                        xtype: 'numberfield',
                        name:'EndAfter',
                        disabledCls: 'removeDisableStyle',
                        minValue: 1,
                        maxValue: 99,
                        width: 70,
                        style: 'text-align: right',
                        margin: '0 5 5 5',
                        bind: {
                            value: '{endAfterOccurancesValue}',
                            disabled: '{!isAdmin}',
                        },
                    }, {
                        xtype: 'label',
                        userCls: 'user-label-class',

                        // listeners: {
                        //     added: function( container, pos, eOpts )
                        //     {
                        //         var me = this;
                        //         let radioButton = this.prev('radio');
                        //         if (radioButton != null)
                        //         {
                        //             me.userCls = radioButton.boxLabelCls;
                        //         }
                        //     },
                        //     render: function(c){
                        //         c.getEl().on('click', function(){
                        //           Ext.Msg.alert('Hello', 'World');
                        //         }, c);
                        //       }
                        // },

                        bind: {
                            text: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.Occurances}',
                            //disabled :'{!isAdmin}'
                        },
                    }]
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    disabledCls: 'removeDisableStyle',

                    bind: {
                        hidden: '{!recurringOrDayOfWeekModeActive}',
                        disabled: '{!isAdmin}'
                    },

                    items: [{
                        xtype: 'radio',
                        name: 'endRadio'+cardId,
                        cls: 'endRadioButton',
                        disabledCls: 'removeDisableStyle',
                        bind: {
                            boxLabel: '{resources.ConfigurationFilesClient.JobsView.JobSchedulePanel.EndBy}',
                            value: '{endRadioEndBy}',
                            //disabled :'{!isAdmin}'
                        },
                    }, {
                        xtype: 'datetimefield',
                        ui: 'timeresolution-text',
                        name:'EndTimeField',
                        width: 200,
                        margin: '5',
                        //format: 'd-m-Y g:i',
                        //emptyText: 'dd/mm/yy, --:--',
                        submitEmptyText: false,
                        invalidText: LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.InvalidDateTimeValue'),
                        formatText: LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobsView.JobSchedulePanel.ExpectedDateTimeValue'),

                        bind: {
                            value: '{endByTimeDateValue}',
                            //disabled :'{!isAdmin}'
                            //invalidText: '{InvalidDateTimeValue}',
                        },
                    }]
                },
            ],

            me.callParent(arguments);

    },

});