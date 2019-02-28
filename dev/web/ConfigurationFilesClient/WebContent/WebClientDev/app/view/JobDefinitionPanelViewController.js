Ext.define('ConfigurationFilesClient.view.JobDefinitionPanelViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.job-definition-panel-view-controller',

    beforestoreload:function(){
        var me = this;
            //view = me.getView().down('#innerPanel');

        //view.mask();
    },
    storeload:function(){
        var me = this;
        //view = me.getView().down('#innerPanel');
        //view.unmask();
    }
});