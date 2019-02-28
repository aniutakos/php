Ext.define('ConfigurationFilesClient.view.JobDetailsContainerView', {
    extend: 'Ext.panel.Panel',
    xtype: 'job-details-container-view',

    layout: 'card',

    viewModel: {
        type: 'job-details-container-view-model'
    },

    controller: 'job-details-container-view-controller',

    onBoxReady: function () {
        var me = this;
        var vm = me.getViewModel();

        var cardMessageTextId = vm.get('cardMessageTextId');

        var messageCard = Ext.create('Ext.panel.Panel', {
            itemId: cardMessageTextId,
            layout: {
                type: 'vbox',
                align: 'middle',
                padding: 3
            },
            items:[{
                        xtype: 'label',
                        cls: 'grey-label-jobs',
                        //margin: '100 0 10 0',
                        //html:'test',
                        flex:1,
                        bind: {
                            html: '{messageTextCard}',
                            //flex: '{messageFlex}'
                        }
                    }]
            // items: [{
            //     xtype: 'panel',
            //     flex: 1,
            //     layout: {
            //         type: 'hbox',
            //         align: 'middle'
            //     },
            //     items: [{
            //         xtype: 'label',
            //         cls: 'grey-label-jobs',
            //         margin: '100 0 10 0',
            //         //html:'test',
            //         //flex:1,
            //         bind: {
            //             html: '{messageTextCard}',
            //             //flex: '{messageFlex}'
            //         }
            //     }]
            // }

            // ]
        });
        me.add(messageCard);

        vm.bind('{navigatorGridSelection}', function (newValue, oldValue) {
            var me = this;
            var vm = me.getViewModel();
            var cardId = '';
            var controller = me.getController();
            var grid = Ext.getCmp("jobs-grid");
            if (oldValue && oldValue.length == 1) {
                var record = grid.getStore().findRecord('name', oldValue[0].data.name, 0, false, true, true);
                var isJobDeleted = !record;
                var oldCard = controller.getJobCard(oldValue[0].data.name);
                var isJobChanged = oldCard.getController().isJobChanged();
                if (isJobChanged.value && !isJobDeleted) {
                    ExtCore.ux.message.MessageBox.show('warning', 'Save',isJobChanged.message ,
                        function (buttonId) {
                            if (buttonId == 'yes') {
                                var validation = controller.validateMandatoryFields(oldValue[0].data.name);
                                if (validation.isValid) {
                                    controller.saveExistingJob(oldValue[0].data);
                                }
                                else {
                                    ExtCore.ux.message.MessageBox.show('Error', 'Error',validation.message);
                                    me.up('jobs-view').getController().setJobsGridSelection(oldValue);
                                }
                            }
                            else if (buttonId == 'no') {
                                controller.unsaveJob(oldValue[0].data);
                            }
                            else if (buttonId == 'cancel') {
                                me.up('jobs-view').getController().setJobsGridSelection(oldValue);
                            }
                        }, {
                            buttons: [{
                                text: "Yes",
                                action: "yes",
                                //default: false
                            },
                            {
                                text: "No",
                                action: "no",
                                //default: true
                            },
                            {
                                text: "Cancel",
                                action: "cancel"
                            }
                            ]
                        }
                    );
                }

            }
            if (newValue && newValue.length == 1) {
                // case that new job was not saved 
                var activeCard = me.getLayout().getActiveItem().down('job-definition-panel');
                if (vm.get('isNew') && newValue[0].data.name != activeCard.getViewModel().get('jobName') && !grid.getStore().findRecord('name', activeCard.getViewModel().get('jobName'), 0, false, true, true)) {
                    ExtCore.ux.message.MessageBox.show('warning', 'Save', LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobDetailsContainerView.saveJobMessage'),
                        function (buttonId) {
                            if (buttonId == 'yes') {
                                var validation = controller.validateMandatoryFields();
                                if (validation.isValid) {
                                    controller.saveJob();
                                }
                                else {
                                    ExtCore.ux.message.MessageBox.show('Error', 'Error',validation.message);
                                    grid.setSelection(null);
                                    //var newJobCard = me.getLayout().getActiveItem().itemId;
                                    //me.up('jobs-view').getController().setJobsGridSelection(newJobCard);
                                }
                            }
                            else if (buttonId == 'no') {
                                var selected = newValue[0].data;
                                controller.moveToCard(selected.name);
                                //controller.unsaveJob(oldValue[0].data);
                            }
                            else if (buttonId == 'cancel') {
                                grid.setSelection(null);
                            }
                        }, {
                            buttons: [{
                                text: "Yes",
                                action: "yes",
                                //default: false
                            },
                            {
                                text: "No",
                                action: "no",
                                //default: true
                            },
                            {
                                text: "Cancel",
                                action: "cancel"
                            }
                            ]
                        }
                    );
                }
                else {
                    var selected = newValue[0].data;
                    controller.moveToCard(selected.name);
                }

            }
            else {
                if (!vm.get('isNew')) {
                    cardId = vm.get('cardMessageTextId');
                    controller.setActiveCard(cardId);
                }
            }
        }, this);
        //me.getLayout().setActiveItem(cardMessageTextId);

    },

    items: [
        // {
        //     xtype: 'panel',
        //     id: 'empty-card'
        // }
    ]

});