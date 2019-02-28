Ext.define('ConfigurationFilesClient.view.RadioButtonExtra', {
    extend: 'Ext.panel.Panel',
    xtype: 'rb-extra',

    constructor: function (config, item1, item2, item3) {

        this.superclass.constructor.call(this);
        Ext.apply(this, config);

        this.radio = new Ext.form.field.Radio({
            name: this.name,
            value: this.value,
            //boxLabel: '', //this.boxLabel + ': ',
            fieldLabel: '432434',
            hideEmptyLabel: true,
            labelAlign: '"top',
            boxLabelAlign: "left",
            border: 3,
            style: {
                borderColor: 'red',
                borderStyle: 'solid'
            }
        });

        // this.radio2 = Ext.Create('radiofield', {
        //      name: this.name,
        //      value: this.value,
        //      boxLabel: this.boxLabel + ': ',
        //      fieldLabel: ''
        // });

        this.field = new Ext.form.TextField({
            disabled: true,
            name: 'field_' + this.name,
            fieldLabel: 'dfsfdsf'
        });

        this.layout = "column";
        this.border = false;

        this.add([this.radio, {
            
        
            items: this.radio,
            //unstyled: true,
            layout: 'form',
            // fieldLabel: 'field label',
            // boxLabel: 'box label',
        }, {
            layout: 'form',
            xtype: 'label',
            text: 'test field',
        
        }, {
            labelWidth: 1,
            layout: 'form',
            //unstyled: true,
            items: this.field
        }]);

        this.subscribeEvents();
    },
    subscribeEvents: function () {
        this.radio.on('change', this.toggleState, this);
    },
    toggleState: function (e, checked) {
        if (checked) {
            this.field.enable();
            this.field.focus();
        }
        else {
            this.field.disable();
        }
    }

});