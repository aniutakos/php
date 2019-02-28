Ext.define('ConfigurationFilesClient.view.CompareFilesWindowViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.compare-files-window-view-model',

    data: {
        changedLinesNum:0,
        deletedLinesNum:0,
        addedLinesNum:0,
        LinesToJump:[],
        currentFocusedLine:null,
        isNoChanges:false
    }

    
});