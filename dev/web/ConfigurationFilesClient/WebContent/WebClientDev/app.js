/*

 * This file launches the application by asking Ext JS to create

 * and launch() the Application class.

 */

Ext.application({

    extend: 'ConfigurationFilesClient.Application',



    name: 'ConfigurationFilesClient',



    requires: [

        'ConfigurationFilesClient.*'

    ]



    // The name of the initial view to create.

    //mainView: 'HelixUI.view.main.Main'

});