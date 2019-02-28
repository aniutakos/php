// Ext.define('Ext.overrides.dom.Element', {
//     override: 'Ext.dom.Element',
//     get: function (el) {
//         if (Ext.Element.cache.hasOwnProperty(el)) {
//             Ext.Element.cache[el].destroy();
//         }
//         return this.callParent(arguments);
//     }
// });

console.info("Starting Tests ...");
window.__karma__.loaded = karmaLoadedFunction;
window.__karma__.loaded();