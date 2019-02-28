Ext.define('ConfigurationFilesClient.view.JobsViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Jobs-view-controller',

    setJobsGridSelection: function (selection) {
        var me = this;
        var view = me.getView();
        var grid = view.down('multiselection-gridpanel');
        grid.setSelection(selection);
    }
});
