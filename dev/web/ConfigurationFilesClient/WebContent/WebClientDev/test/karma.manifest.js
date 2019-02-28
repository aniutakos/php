Ext.manifest = {};
Ext.manifest.env = 'testing';
Ext.manifest.resources = [];

window.onerror = function () {
    window.onerror = function () {
        return true;
    };
    window.__karma__.loaded = karmaLoadedFunction;
    window.__karma__.loaded();
};

