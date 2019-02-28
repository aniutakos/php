/**
 * Created by ornaz on 12/08/2018.
 */

Ext.define('ConfigurationFilesClient.view.MultiSelectionGridPanel', {
    extend: 'Ext.grid.Panel',
    xtype:'multiselection-gridpanel',


    config: {
        multiSelection: null
    },


    publishes: {
        multiSelection: true
    },


    applyMultiSelection: function(value, oldValue) {
        return Ext.Array.from(value);
    },


    updateBindSelection: function(selModel, selection) {
        this.setMultiSelection(selection);
        return this.callParent(arguments);
    }
});
