
Ext.define('ConfigurationFilesClient.view.AddNEsWindowViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.add-nes-window-view-controller',

    fileTypeFieldName: "ConfFileTypeConfigId",

    searchInstances: function () {
        var me = this;
        var view = me.getView();
        var vm = me.getViewModel();
        var rules = view.down('query-builder').getRules();
        var queryParams = vm.get('query_params').getValuesParameters;
        rulesTransformed = me.calculate(rules);
       
        queryParams.filter = me.addFileConfigurationFilter(rulesTransformed);
        queryParams.limit = 200;

        var grid = view.down('gridpanel');
        var store = grid.getStore();
        store.query_params =queryParams;
        store.loadData([]);
        store.load({
            scope: view});
    },

    
    calculate: function (dataIn, parentOp) {
        var me = this;
        if (!dataIn || dataIn.length == 0||dataIn.rules.length == 0) return null;
       // var result = { operator: me.calculateRecursive(dataIn, parentOp) };
       return me.calculateRecursive(dataIn, parentOp);
    },

    calculateRecursive: function (dataIn, parentOp) {
        var me = this;

        if (!this.opMap) this.prepareInit();

        if (!parentOp) parentOp = dataIn.condition;

        //var array = [],
        innerRule = undefined;
        var root = null;
        for (var ruleNum in dataIn.rules) {

            if (!root) {
                root = {logicaOperator:{ operand1: null, operatorType:parentOp }};
            }
            var rule = dataIn.rules[ruleNum];
            var newRule = null
            if (rule.rules) {
                newRule = me.calculateRecursive(rule.rules, rule.condition)              
            }
            else {
                newRule = me.TransformToBaseRule(rule, parentOp)
            }
            if (!root.logicaOperator.operand1) {
                root.logicaOperator.operand1 = newRule
            }
            else if (!root.logicaOperator.operand2) {
                root.logicaOperator.operand2 = newRule
            }
            else {
                root = {
                    logicaOperator: { operand1: root, operand2: newRule ,operatorType:parentOp}
                    
                }
            }
        }
        return root;
    },

    TransformToBaseRule: function (rule, parentOp) {
        var sep = rule.field.indexOf('|'),
            ruleType = rule.field.slice(0, sep),
            key = rule.field.slice(sep + 1, rule.field.length);
        var result = 
        {
        conditionOperator: {
                operatorType: this.opMap[rule.operator],
                identifier: {
                    name: key
                },
                literal: {
                    type: 'string',
                        value: rule.value
                }
            },
        };
        return result;
    },


    calculate2:function(dataIn, parentOp){
        if (!this.opMap) this.prepareInit();

        if (!parentOp) parentOp = dataIn.condition;

        var array = [],
            innerRule = undefined;
        for (var ruleNum in dataIn.rules) {
            var rule = dataIn.rules[ruleNum];

            if (['OR', 'AND'].indexOf(dataIn.condition) > -1) {
                innerRule = this.calculate(rule, dataIn.condition);
            }

            var operator = rule.operator;
            if (operator) {
                var sep = rule.field.indexOf('|'),
                    ruleType = rule.field.slice(0, sep),
                    key =  rule.field.slice(sep+1,rule.field.length);
                    //key = rule.data.label;
                array.push({ name: key, type: ruleType, values: rule.value, dataType: rule.type, operator: this.opMap[operator] });
            }
        }
        var root = this.makeConditions(array, parentOp);
        if (innerRule) {
            root.push(innerRule);
        }
        while (root.length > 1) {
            root = this.makeLogical(root, parentOp);
        }
        return root[0];
    },
    AddSelected: function(){
        var me = this;
        var view = me.getView();
        var selection = view.down('gridpanel').getSelection();
        var cardContainer = Ext.ComponentQuery.query('job-details-container-view')[0];
        var gridToAddRecords =cardContainer.getLayout().getActiveItem().down('gridpanel[name=gridpanelSelectInstances]');
        //var gridToAddRecords =cardContainer.getLayout().getActiveItem().down('gridpanel');
        //var gridToAddRecords = Ext.getCmp('gridPanelSelectInstance');
        gridToAddRecords.getStore().loadData(selection,true);
        if(selection.length > 0){
            var jobDefinition = cardContainer.getLayout().getActiveItem().down('job-definition-panel');
            jobDefinition.getViewModel().set('isNesNumberPositive',true);
        }
        view.hide();       
    },

    addFileConfigurationFilter:function(rulesTransformed){
        var me = this;
        var view = me.getView();
        var cardContainer = Ext.ComponentQuery.query('job-details-container-view')[0];
        var jobDefinition = cardContainer.getLayout().getActiveItem().down('job-definition-panel');

        var configurationFileCombo = jobDefinition.down('combo[name=ConfigFileCombo]');
        var configurationFileValue = configurationFileCombo.value;

        var queryFilter ={ 
            expression:{
                operator:{
                    operand1:{
                        logicaOperator:{
                            operand1:{
                                conditionOperator:{
                                    identifier:{
                                        name:this.fileTypeFieldName
                                    },
                                    literal:{
                                        type:'string',
                                        value:configurationFileValue
                                    },
                                    operatorType:'EQ_IC'
                                }
                            },
                            operatorType:'AND'  
                        }                      
                    },
                    //operand2:rulesTransformed,
                    operatorType:'AND'
                }
            
            }
        };
        if(rulesTransformed){
            queryFilter.expression.operator.operand2 =rulesTransformed;
        }
        return queryFilter;
     },

    prepareInit: function () {
        this.ml = $.fn.queryBuilder.regional[this.lang];
        this.opMap = {
            'or': 'OR',
            'and': 'AND',
            //'equal': 'EQ_IC',
            //'not_equal': 'NE_IC',
            'greater': 'GT',
            'less': 'LT',
            'is': 'EQ_IC',
            'in': 'IN',
            'is_not': 'NE_IC',
            'greater_or_equal': 'GE',
            'less_or_equal': 'LE',
            'is_null': 'IS_NULL',
            'is_not_null': 'NOT_IS_NULL',
            'between': 'BETWEEN',
            'contains': 'LIKE_IC',
            'not_contains': 'NOT_LIKE_IC',
            'begins_with': 'BEGIN_WITH_IC',
            'ends_with': 'END_WITH_IC'
        };
    },
    
    getFilterOperand: function (name, value, operator, type, dataType) {
        var Operand,
            condType ='CONFIG_ATTRIBUTE';


        // if (operator == 'IN') {
        //     var values = value.split(',');
        //     if (dataType != 'string') {
        //         value = _.map(values, function (v) {
        //             return Ext.Number.parseFloat(v);
        //         })
        //     } else {
        //         value = values;
        //     }
        // }
        if (dataType != 'string') {
            if (operator == 'BETWEEN') {
                value[0] = Ext.Number.parseFloat(value[0]);
                value[1] = Ext.Number.parseFloat(value[1]);
            } else {
                value = Ext.Number.parseFloat(value);
            }
        }

        if (operator == 'BETWEEN') {
            Operand = {
                operator: {
                    operatorType: 'AND',
                    operand1: {
                        conditionOperator: {
                            "operatorType": 'GE',
                            "identifier": { name: name },

                            //"identifier": { name: condType },
                            "literal":  { value: value[0], type:"string"}
                        }
                    },
                    operand2: {
                        conditionOperator: {
                            "operatorType": 'LE',
                            "identifier": { name: name },
                            "literal": { value: value[1], type:"string"}
                        }
                    }
                }
            };
        }
        else {
            Operand = {
                conditionOperator: {
                    "operatorType": operator,
                    "identifier": { name: name },
                    "literal":{ value: value, type:"string"}
                }
            };
        }

        return Operand;
    },
    makeLogical: function (array,parentOp) {
        var log_array = [];
        for (var i = 0; i < array.length; i++) {
            var Operand1 = undefined, Operand2 = undefined, logical;
            Operand1 = array[i];
            if (i + 1 <= array.length - 1) {
                Operand2 = array[i + 1];
            }
            i++;
            if (Operand1 && Operand2)
                logical = { logicaOperator: { operand1: Operand1, operand2: Operand2, operatorType: parentOp } };
            else if (Operand1)
                logical = { logicaOperator: { operand1: Operand1, operatorType: parentOp } };
            log_array.push(logical);
        }
        return log_array;
    },
    makeConditions: function (array, parentOp) {
        var me = this,
            cond_array = [];

        for (var i = 0; i < array.length; i++) {
            var Operand1 = undefined, Operand2 = undefined, cond,
                op1 = array[i],
                name1 = op1.name,
                value1 = op1.values,
                condType1 = op1.type,
                dataType1 = op1.dataType,
                opType1 = op1.operator,
                Operand1 = me.getFilterOperand(name1, value1, opType1, condType1, dataType1);

            if (i + 1 <= array.length - 1) {
                var op2 = array[i + 1],
                    name2 = op2.name,
                    value2 = op2.values,
                    condType2 = op2.type,
                    dataType2 = op2.dataType,
                    opType2 = op2.operator,
                    Operand2 = me.getFilterOperand(name2, value2, opType2, condType2, dataType2);
            }
            if (Operand1 && Operand2)
                cond = { logicaOperator: { operand1: Operand1, operand2: Operand2, operatorType: parentOp } };
            else if (Operand1)
                cond = { logicaOperator: { operand1: Operand1, operatorType: 'AND' } };

            cond_array.push(cond);
            i++;
        }
        return cond_array;
    },
    getOperators: function () {
        var operators = [
            { type: "equal", nb_inputs: 1, multiple: !1, apply_to: ["number", "datetime", "boolean"] },
            { type: "not_equal", nb_inputs: 1, multiple: !1, apply_to: ["number", "datetime", "boolean"] },

            { type: "is", nb_inputs: 1, multiple: !1, apply_to: ["string"] },
            { type: "is_not", nb_inputs: 1, multiple: !1, apply_to: ["string"] },
            { type: "contains", nb_inputs: 1, multiple: !1, apply_to: ["string"] },
            { type: "not_contains", nb_inputs: 1, multiple: !1, apply_to: ["string"] },
            { type: "begins_with", nb_inputs: 1, multiple: !1, apply_to: ["string"] },
            { type: "ends_with", nb_inputs: 1, multiple: !1, apply_to: ["string"] },

            { type: "less", nb_inputs: 1, multiple: !1, apply_to: ["number"] },
            { type: "less_or_equal", nb_inputs: 1, multiple: !1, apply_to: ["number"] },
            { type: "greater", nb_inputs: 1, multiple: !1, apply_to: ["number"] },
            { type: "greater_or_equal", nb_inputs: 1, multiple: !1, apply_to: ["number"] },
            { type: "between", nb_inputs: 2, multiple: !1, apply_to: ["number"] },

            { type: 'is_null', nb_inputs: 0, multiple: !1, apply_to: ['string', 'datetime', 'boolean'] },
            { type: 'is_not_null', nb_inputs: 0, multiple: !1, apply_to: ['string', 'datetime', 'boolean'] },

            { type: "in", nb_inputs: 1, multiple: !0, apply_to: ["string", "number"] }
        ];

        return operators;
    }

});