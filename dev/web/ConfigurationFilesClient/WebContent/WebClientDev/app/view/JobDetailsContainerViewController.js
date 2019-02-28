Ext.define('ConfigurationFilesClient.view.JobDetailsContainerViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.job-details-container-view-controller',

    openNewJobCard: function () {
        var me = this;
        var view = me.getView();
        var viewModel = view.getViewModel();
        var availableCardId = 'new-job' + UuidGenerator.getUuIDValid();
        var emptyNewCard = Ext.create('ConfigurationFilesClient.view.JobDetailsView', {
            itemId: availableCardId,
        });
        view.add(emptyNewCard);
        viewModel.set('selectedJob', null);

        me.setActiveCard(availableCardId);
        viewModel.set('isNew', true);
        var grid = Ext.getCmp("jobs-grid");
        grid.setSelection(null);
    },

    setActiveCard: function (cardID) {
        var me = this;
        var view = me.getView();
        var viewModel = view.getViewModel();
        view.getLayout().setActiveItem(cardID);
        if (me.isExistingCardId(cardID)) {
            viewModel.set('isNew', false);
            var card = view.getLayout().getActiveItem(cardID);
            card.setActiveTab(0);
        }
    },
    // isJobChanged: function(job) {

    // }
    // isJobChangeddd: function(job) {
    //     var me = this;
    //     view = me.getView();
    //     var grid = Ext.getCmp("jobs-grid");

    //     job = grid.getStore().findRecord('name', job.name, 0, false, true, true);
    //     if (!job) {
    //         return;
    //     }
    //     job = job.data;
    //     var jobCard = me.getJobCard(job.name);
    //     if (!jobCard) {
    //         return false;
    //     }

    //     var jobDefinition = jobCard.down('.job-definition-panel');
    //     var jobDefinitionVM = jobDefinition.getViewModel();
    //     //var currentJobDefinitionView = me.getView().getLayout().getActiveItem().down('job-definition-panel');
    //     //var currentJobDefinitionViewModel = currentJobDefinitionView.getViewModel();
    //     var message = "";

    //     var jobNotChanged = false;

    //     var isConfigurationFileTypeNotChanged = jobDefinitionVM.get('configurationFileType') == job.configFileType;

    //     var currActivity = jobCard.query('toggle-switch')[0].getValue()? true : false
    //     var isActivityNotChanged = currActivity == job.enabled;
    //     var isDescriptionNotChanged = jobDefinitionVM.get('description') == job.description;

    //     var isSelectedNesRadioNotChanged = job.selectedNEs.neCriteria ? jobDefinitionVM.get('isDynamicRule') : jobDefinitionVM.get('isSelectInstances');

    //     var isSelectedNesNotChanged = isSelectedNesRadioNotChanged;
    //     if (isSelectedNesRadioNotChanged) {
    //         var selectedNEs = null;
    //         var currentSelectedNes = null;
    //         if (job.selectedNEs.neCriteria) {
    //             selectedNEs = job.selectedNEs.neCriteria.expression; // job.selectedNEs.neList;
    //             currentSelectedNes = me.getSelectedNes(job.name).neCriteria.expression;

    //             selectedNEs = me.convertFilter({ "logicaOperator": selectedNEs.operator });
    //             currentSelectedNes = me.convertFilter({ "logicaOperator": currentSelectedNes.operator });
    //             isSelectedNesNotChanged = JSON.stringify(selectedNEs) == JSON.stringify(currentSelectedNes);
    //         } else {
    //             selectedNEs = JSON.parse("[" + job.selectedNEs.neList + "]").sort();
    //             currentSelectedNes = JSON.parse("[" + me.getSelectedNes(job.name).neList + "]").sort();
    //             isSelectedNesNotChanged = JSON.stringify(selectedNEs) == JSON.stringify(currentSelectedNes);
    //         }

    //     }
    //     var isScheduleNotChanged = JSON.stringify(job.schedule) == JSON.stringify(me.getJobSchedule(job.name));

    //     jobNotChanged = isActivityNotChanged && isConfigurationFileTypeNotChanged && isDescriptionNotChanged && isSelectedNesRadioNotChanged && isSelectedNesNotChanged && isScheduleNotChanged;

    //     message = !jobNotChanged ? LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobDetailsContainerView.saveJobMessage') :"";
    //     if(jobDefinitionVM.get('ExistDeletedNes')){
    //         jobNotChanged = false;
    //         message = "Changes found in the job details.<BR>"+
    //        "Some of the job's network elements were deleted from the configuration model.<BR>"+
    //         "Do you want to save the job details?";
    //     }

    //     return {value:!jobNotChanged , message:message};
    // },

    unsaveJob: function (job) {
        var me = this;
        if (!job) {
            return;
        }
        var card = me.getJobCard(job.name);
        if (!card) {
            return;
        }
        var jobDefinition = card.down('job-definition-panel');
        var jobDefinitionViewModel = jobDefinition.getViewModel();
        jobDefinitionViewModel.set('jobName', job.name);
        jobDefinitionViewModel.set('jobId', job.name);
        jobDefinitionViewModel.set('configurationFileType', job.configFileType);
        jobDefinitionViewModel.set('description', job.description);

        var jobDetailsView = view.getLayout().getActiveItem();
        var jobDetailsViewModel = jobDetailsView.getViewModel();
        jobDetailsViewModel.set('jobActivity', job.enabled ? 1 : 0);
        //card.query('toggle-switch')[0].setValue(job.enabled);

        me.setSelectedNes(job.selectedNEs, job.name);
        me.setJobSchedule(job.schedule, job.name);
        // if(card)  {
        //     jobDefinition = card.down('job-definition-panel');
        // }  
    },

    saveExistingJob: function (job) {
        if (job) {
            var me = this;
            var view = me.getView();
            var card = me.getJobCard(job.name);
            var jobDefinition = card.down('job-definition-panel');
            var vm = jobDefinition.getViewModel();
            var jobType = vm.get('jobType');
            var configFileType = vm.get('configurationFileType');
            var description = vm.get('description');
            var jobEnabled = vm.get('jobActivity') ? true : false;
            var selectedNEs = me.getSelectedNes(job.name);
            var jobSchedule = me.getJobSchedule(job.name);
            var record = {
                "job": {
                    "selectedNEs": selectedNEs,
                    "name": job.name,
                    "type": jobType,
                    "configFileType": configFileType,
                    "description": description,
                    "enabled": jobEnabled
                },
                "schedule": jobSchedule
            };
            var cardContainer = Ext.ComponentQuery.query('job-details-container-view')[0];

            cardContainer.getController().AddJobAudit('CD_Edit_Scheduled_Job', job);

            InteropService.evaluateInterconnectPointMap('ConfigurationFilesClient', 'CFMGenericService').then(function (data) {
                var URL = SessionProvider.buildURL(data.WebServiceInterConnectingPointData[0].StaticData.FullURL.RelativeURL + "/updateScheduledJob");
                Ext.Ajax.request({
                    url: URL,
                    method: 'POST',
                    jsonData: record,
                    success: function (response) {
                        //Ext.Msg.alert('Success', "Job saved succesfully");
                        ExtCore.ux.message.MessageBox.alert('Success', 'Success', "Job saved succesfully");
                        var grid = Ext.getCmp("jobs-grid");
                        grid.toSelect = grid.getSelection();
                        if(jobDefinition.getViewModel().get('ExistDeletedNes')){
                            jobDefinition.getViewModel().set('ExistDeletedNes',false);
                        }
                        var card = me.getJobCard(job.name);
                        if (card) {
                            var newState = card.getController().getCurrentState();
                            card.getViewModel().set('initialState', newState);
                        }
                        grid.getStore().reload({
                            scope: this,
                            callback: function (records, operation, success) {
                                var grid = Ext.getCmp("jobs-grid");
                                if(grid.toSelect[0]){
                                    var job = records.find(function (element) {

                                        return element.data.name === grid.toSelect[0].data.name;
                                    });
                                    grid.setSelection(job);
                                }
                                
                            }
                        });
                    },
                    failure: function () {
                        //Ext.Msg.alert('Error', "Failed to save job");
                        ExtCore.ux.message.MessageBox.show('Error', 'Error', "Failed to save job");
                        //JCoreLogger.error(msg);
                    }
                });
            });
        }
    },
    saveJob: function () {
        var me = this;
        var view = me.getView();
        var jobDefinition = view.getLayout().getActiveItem().down('job-definition-panel');
        var vm = jobDefinition.getViewModel();
        var jobName = vm.get('jobName').trim();
        var jobType = vm.get('jobType');
        var configFileType = vm.get('configurationFileType');
        var description = vm.get('description');
        var selectedNEs = me.getSelectedNes();
        var jobSchedule = me.getJobSchedule();
        var jobDetailsView = view.getLayout().getActiveItem();
        var jobDetailsViewModel = jobDetailsView.getViewModel();
        var jobEnabled = jobDetailsViewModel.get('jobActivity') ? true : false;
        //var jobEnabled = view.getLayout().getActiveItem().query('toggle-switch')[0].getValue() ? true : false;
        var isNew = vm.get('isNew');
        //vm.set('isSavePressed', true);
        var grid = Ext.getCmp("jobs-grid");
        var oldRecord = grid.getStore().findRecord('name', jobName, 0, false, true, true);
        if (oldRecord && isNew) {
            ExtCore.ux.message.MessageBox.show('Error', 'Error', "job name exists, please change the name");
            return;
        }
        var validation = me.validateMandatoryFields();
        if (!validation.isValid) {
            ExtCore.ux.message.MessageBox.show('Error', 'Error', validation.message);
            return;
        }
        if (!me.validatejobName()) {
            ExtCore.ux.message.MessageBox.show('Error', 'Error', "The Job Name is not valid.<BR>Allowed characters are letters, digits,<BR> space and minus");
            return;
        }
        var job = {
            "job": {
                "selectedNEs": selectedNEs,
                "name": jobName,
                "type": jobType,
                "configFileType": configFileType,
                "description": description,
                "enabled": jobEnabled
            },
            "schedule": jobSchedule
        };

        var record = {
            "selectedNEs": selectedNEs,
            "name": jobName,
            "type": jobType,
            "configFileType": configFileType,
            "description": description,
            "enabled": jobEnabled,
            "schedule": jobSchedule
        };

        var requestName = isNew ? 'createScheduledJob' : 'updateScheduledJob';
        InteropService.evaluateInterconnectPointMap('ConfigurationFilesClient', 'CFMGenericService').then(function (data) {
            var URL = SessionProvider.buildURL(data.WebServiceInterConnectingPointData[0].StaticData.FullURL.RelativeURL + "/" + requestName);
            Ext.Ajax.request({
                url: URL,
                method: 'POST',
                jsonData: job,
                success: function (response) {
                    //Ext.Msg.alert('Success', "Job saved succesfully");
                    ExtCore.ux.message.MessageBox.alert('Success', 'Success', "Job saved succesfully");
                    var grid = Ext.getCmp("jobs-grid");
                    jobSelected = grid.getSelection()[0];
                    var card = me.getJobCard(jobName);
                    if (card) {
                        var newState = card.getController().getCurrentState();
                        card.getViewModel().set('initialState', newState);
                    }

                    grid.toSelect = grid.getSelection();
                    grid.getStore().reload({
                        scope: this,
                        callback: function (records, operation, success) {
                            var grid = Ext.getCmp("jobs-grid");
                            var cardContainer = Ext.ComponentQuery.query('job-details-container-view')[0];

                            var job = null;
                            if (grid.toSelect && grid.toSelect.length > 0) {
                                job = records.find(function (element) {

                                    return element.data.name === grid.toSelect[0].data.name;
                                });
                                if(job){
                                    cardContainer.getController().AddJobAudit('CD_Edit_Scheduled_Job', job.data);
                                    grid.setSelection(job);
                                }
                                

                            } else {
                                var jobDefinitionView = cardContainer.getLayout().getActiveItem().down('job-definition-panel');
                                if (jobDefinitionView) {
                                    var jobDefinitionViewModel = jobDefinitionView.getViewModel();
                                    var jobName = jobDefinitionViewModel.get('jobName');
                                    job = records.find(function (element) {

                                        return element.data.name === jobName;
                                    });

                                    var cardContainerViewModel = cardContainer.getViewModel();
                                    var isSave = cardContainerViewModel.get('isNew');
                                    if (isSave) {
                                        cardContainer.getController().AddJobAudit('CD_Add_Scheduled_Job', job.data);
                                    } else {
                                        cardContainer.getController().AddJobAudit('CD_Edit_Scheduled_Job', job.data);
                                    }
                                }
                                grid.setSelection(job);

                            }


                            // var grid = Ext.getCmp("jobs-grid");
                            //     var job = records.find(function (element) {

                            //         return element.data.name === jobName;
                            //     });

                        }
                    });
                },
                failure: function () {
                    //Ext.Msg.alert('Error', "Failed to save job");
                    ExtCore.ux.message.MessageBox.show('Error', 'Error', "Failed to save job");
                    //JCoreLogger.error(msg);
                }
            });
        });

    },
    validatejobName: function () {
        var me = this;
        var view = me.getView();
        var jobDefinition = view.getLayout().getActiveItem().down('job-definition-panel');
        var vm = jobDefinition.getViewModel();
        var jobName = vm.get('jobName');
        validNameRegex = "^[a-zA-Z0-9- ]+$";
        var re = new RegExp(validNameRegex);
        return re.test(jobName);
    },
    validateMandatoryFields: function (jobName) {
        var me = this;
        var view = me.getView();

        var message = "Mandatory fields are missing";
        var jobDefinition = view.getLayout().getActiveItem().down('job-definition-panel');
        var scheduleView = view.getLayout().getActiveItem().down('job-schedule-panel');
        if (jobName) {
            var card = me.getJobCard(jobName);
            if (card) {
                jobDefinition = card.down('job-definition-panel');
                scheduleView = card.down('job-schedule-panel');
            }
        }

        var jobDefinitionViewModel = jobDefinition.getViewModel();
        var scheduleViewModel = scheduleView.getViewModel();
        jobDefinitionViewModel.set('isSavePressed', true);
        var jobNameTest = jobDefinitionViewModel.get('jobName').trim();
        var configFileType = jobDefinitionViewModel.get('configurationFileType');
        var isdayOfWeek = scheduleViewModel.get('dayOfWeekModeActive');
        var selectedNEs = me.getSelectedNes(jobName);
        // if (jobName) {
        //     selectedNEs = me.getSelectedNes(jobName);
        // }
       
        var isValid = true;
        if (jobNameTest == '' || !jobNameTest) {
            isValid = false;
        }
        if (configFileType == '' || !configFileType) {
            isValid = false;
        }
        if (!selectedNEs.neList && !selectedNEs.neCriteria) {
            isValid = false;
        }
        if (isdayOfWeek) {
            var daysSelected = scheduleViewModel.get('daysSelected');
            if (daysSelected.length == 0) {
                isValid = false;
                message = "Select days of week";
            }
        }
        var validateScheduleDates = me.validateScheduleDates(jobName);
        if (!validateScheduleDates.isValid) {
            isValid = false;
            message = validateScheduleDates.message;
        }
        return { "isValid": isValid, "message": message };
    },

    validateScheduleDates: function (jobName) {
        var me = this;
        var view = me.getView();
        var isValid = true;
        var message = "";
        var scheduleView = view.getLayout().getActiveItem().down('job-schedule-panel');
        if (jobName) {
            var card = me.getJobCard(jobName);
            if (card) {
                scheduleView = card.down('job-schedule-panel');
            }
        }
        var scheduleViewModel = scheduleView.getViewModel();
        var dateTimeFields = scheduleView.query('datetimefield');
        for (indx in dateTimeFields) {
            if (!dateTimeFields[indx].getHidden() && !dateTimeFields[indx].isValid()) {
                isValid = false;
                message = 'Date is not valid'
            }
        }
        var numberFields = scheduleView.query('numberfield');

        for (indx in numberFields) {
            if (!numberFields[indx].getHidden() && !numberFields[indx].isValid()) {
                if (numberFields[indx].name != 'EndAfter' || scheduleViewModel.get('endRadioEndAfter')) {
                    isValid = false;
                    message = 'Number is not valid';
                }
            }
        }

        if (!isValid) {
            return { "isValid": isValid, "message": message }
        }
        if (scheduleViewModel.get("endRadioEndBy") && scheduleViewModel.get("ScheduleType") != 0) {
            var startTime = scheduleView.getViewModel().get("startDateTimeValue")
            var endTime = scheduleView.getViewModel().get("endByTimeDateValue");
            if (Ext.Date.diff(startTime, endTime, "s") < 0) {
                isValid = false;
                message = 'Start date should be grater then End date'
            }
        }
        return { "isValid": isValid, "message": message }

    },





    getSelectedNes: function (jobName) {
        var me = this;
        var view = me.getView();
        var card = null;//= view.getLayout().getActiveItem();
        if (jobName) {
            card = me.getJobCard(jobName);
            if (!card) {
                card = view.getLayout().getActiveItem();
            }
        }
        else {
            card = view.getLayout().getActiveItem();
        }
        if(!card || !card.getController().getSelectedNes){
            return null;
        }
        return card.getController().getSelectedNes();
    },

    setSelectedNes: function (selectedNE, jobName) {
        var me = this;
        var view = me.getView();
        var card = null;//= view.getLayout().getActiveItem();
        if (jobName) {
            card = me.getJobCard(jobName);
            if (!card) {
                card = view.getLayout().getActiveItem();
            }
        }
        else {
            card = view.getLayout().getActiveItem();
        }
        return card.getController().setSelectedNes(selectedNE);
    },
    getJobSchedule: function (jobName) { // if job name is not given , takes the current active card
        var me = this;
        var view = me.getView();
        var card = null;//= view.getLayout().getActiveItem();
        if (jobName) {
            card = me.getJobCard(jobName);
            if (!card) {
                card = view.getLayout().getActiveItem();
            }
        }
        else {
            card = view.getLayout().getActiveItem();
        }
        return card.getController().getJobSchedule();
    },
    setJobSchedule: function (schedule, jobName) {
        var me = this;
        var view = me.getView();
        var card = null;//= view.getLayout().getActiveItem();
        if (jobName) {
            card = me.getJobCard(jobName);
            if (!card) {
                card = view.getLayout().getActiveItem();
            }
        }
        else {
            card = view.getLayout().getActiveItem();
        }
        return card.getController().setJobSchedule(schedule);
    },



    getCardId: function (jobName) {
        return 'job_' + jobName.replace(/ /g, "_"); //(/foo/g, "bar")

    },
    isExistingCardId: function (cardId) {
        return cardId.startsWith("job");
    },
    moveToCard: function (jobName) {
        var me = this;
        var view = me.getView();
        var viewModel = view.getViewModel();

        var cardId = me.getCardId(jobName);
        viewModel.set('selectedJob', cardId);
        var isCardExist = me.isCardExist(cardId);
        if (isCardExist) {
            me.setActiveCard(cardId);
        } else {
            //var cardsContainer = view;
            var card = Ext.create('ConfigurationFilesClient.view.JobDetailsView', {
                itemId: cardId,
                id: cardId,
            });
            var job = Ext.getCmp("jobs-grid").getStore().findRecord('name', jobName);

            if (job) {
                job = job.data;
                view.add(card);
                //card.applyState(workspace.data.state);
                me.setActiveCard(cardId);
                //var jobDefinition = view.getLayout().getActiveItem().down('job-definition-panel');
                var jobDefinition =card.down('job-definition-panel');
                var jobDefinitionViewModel = jobDefinition.getViewModel();
                jobDefinitionViewModel.set('jobName', job.name);
                jobDefinitionViewModel.set('jobId', job.name);
                jobDefinitionViewModel.set('configurationFileType', job.configFileType);
                jobDefinitionViewModel.set('description', job.description);

                //var jobDetailsView = view.getLayout().getActiveItem();
                var jobDetailsView = card;
                var jobDetailsViewModel = jobDetailsView.getViewModel();
                jobDetailsViewModel.set('jobActivity', job.enabled ? 1 : 0);
                //card.query('toggle-switch')[0].setValue(job.enabled);
                me.setSelectedNes(job.selectedNEs);
                me.setJobSchedule(job.schedule);
                //card.getController().initializeState();
                return card;
            }
            return null;
        }

    },
    convertFilter: function (expression) {
        var me = this;
        var queryBuilderExpression = new Object(),
            rules = [];
        if (expression.conditionOperator) {
            if (!me.opMapOpposite) me.opMapToOpposite();
            var id = "CONFIG|" + expression.conditionOperator.identifier.name;
            var value = expression.conditionOperator.literal ? expression.conditionOperator.literal.value : null;
            var type = expression.conditionOperator.literal ? expression.conditionOperator.literal.type : null;
            var rule = {
                "id": id,
                field: id,
                type: type,
                input: "text",
                operator: me.opMapOpposite[expression.conditionOperator.operatorType],
                value: value,
                data: {
                    label: expression.conditionOperator.identifier.name
                }
            };
            return rule;
        } else {
            if (expression.logicaOperator) {
                if (!expression.logicaOperator.operand2) {
                    var rule = me.convertFilter(expression.logicaOperator.operand1);
                    return {
                        'condition': expression.logicaOperator.operatorType,
                        'rules': [rule]
                    };
                } else {
                    var rule1 = me.convertFilter(expression.logicaOperator.operand1);
                    var rule2 = me.convertFilter(expression.logicaOperator.operand2);
                    return {
                        'condition': expression.logicaOperator.operatorType,
                        'rules': [rule1, rule2]
                    };
                }
            }
        }

    },

    opMapToOpposite: function () {
        var me = this;
        me.opMapOpposite = new Object();
        if (!me.opMap) me.prepareInit();
        var queryOps = Object.keys(me.opMap);

        _.forEach(queryOps, function (op) {
            me.opMapOpposite[me.opMap[op]] = op;
        })
    },

    prepareInit: function () {
        this.ml = $.fn.queryBuilder.regional[this.lang];
        this.opMap = {
            'or': 'OR',
            'and': 'AND',
            'is': 'EQ_IC',
            'is_not': 'NE_IC',
            //'equal': 'EQ_IC',
            //'not_equal': 'NE_IC',
            'greater': 'gt',
            'less': 'lt',
            'greater_or_equal': 'ge',
            'less_or_equal': 'le',
            'in': 'IN',
            'not_in': 'NOT_IN',
            'is_null': 'IS_NULL',
            'is_not_null': 'NOT_IS_NULL',
            //'is_not_null': 'IsNotNull',
            'between': 'BETWEEN',
            'not_between': 'NOT_BETWEEN',
            'contains': 'LIKE_IC',
            //'not_contains': 'NOT_LIKE',
            'not_contains': 'NOT_LIKE_IC',
            'begins_with': 'BEGIN_WITH_IC',
            'ends_with': 'END_WITH_IC',
            'not_begins_with': 'NOT_BEGIN_WITH_IC',
            'not_ends_with': 'NOT_END_WITH_IC',
            'is_empty': 'IS_EMPTY',
            'is_not_empty': 'IS_NOT_EMPTY'
        };
    },

    getJobCard: function (jobName) {
        var me = this;
        var view = me.getView();
        var cardId = me.getCardId(jobName);
        var result = null;
        cards = view.getLayout().getLayoutItems();
        for (indx in cards) {
            var card = cards[indx];
            if (card.id == cardId) {
                result = card;
                break;
            }
        }
        return result;
    },
    isCardExist: function (cardId) {
        var me = this;
        var view = me.getView();
        cards = view.getLayout().getLayoutItems();
        var cardExist = false;
        for (indx in cards) {
            var card = cards[indx];
            if (card.id == cardId) {
                cardExist = true;
                break;
            }
        }
        return cardExist;
    },

    AddJobAudit: function (eventId, job) {
        var me = this;

        var neType = job.selectedNEs.neList ? 'Ne CIDs' : 'Criteria';
        var neVal = '';
        if (job.selectedNEs.neCriteria) {
            neVal = me.convertFilter({ "logicaOperator": job.selectedNEs.neCriteria.expression.operator });
            neVal = JSON.stringify(neVal);
        } else {
            neVal = job.selectedNEs.neList;
        }
        //neVal = job.selectedNEs.neList ? job.neList : job.selectedNEs.neCriteria;
        var additionalDetails = Ext.String.format('job Name : {0}, File Type : {1}, {2} : {3}', job.name, job.configFileType, neType, neVal);
        AuditService.auditServiceRequest(eventId, true, additionalDetails);
    }
});