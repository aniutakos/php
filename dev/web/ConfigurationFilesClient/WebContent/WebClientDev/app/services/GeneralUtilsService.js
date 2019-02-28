Ext.define('ConfigurationFilesClient.services.GeneralUtilsService', {
    alternateClassName: 'GeneralUtilsService',
    singleton: true,
    requires: [
        'Ext.Deferred',
    ],


    GetArrayAsString: function(inputArray, withQuotationMarks) {
        if (!Ext.isArray(inputArray))
            return null;
        if (typeof(inputArray) == false)
            return null;
        var str = withQuotationMarks ? '"' : '';
        for (var i = 0; i < inputArray.length; i++) {
            str = str.concat(inputArray[i]);
            if (i != (inputArray.length - 1))
                str = str.concat(',');
        }

        if (withQuotationMarks)
            str = str.concat('"');

        return str;
    },

    Poll: function(fn, timeout, interval) {

        var endTime = Number(new Date()) + (timeout || 2000);
        interval = interval || 100;

        var checkCondition = function(resolve, reject) {

            // If the condition is met, we're done!     
            var result = fn();
            if (result) {
                resolve(result);
            }
            // If the condition isn't met but the timeout hasn't elapsed, go again
            else if (Number(new Date()) < endTime) {
                setTimeout(checkCondition, interval, resolve, reject);
            }
            // Didn't match and too much time, reject!
            else {
                reject(new Error('Poll : timed out for ' + fn + ': ' + arguments));
            }
        };

        return new Ext.Promise(checkCondition);
    },

    PollAsync: function(fn, timeout, interval) {

        var endTime = Number(new Date()) + (timeout || 2000);
        interval = interval || 100;

        var checkCondition = function(resolve, reject) {

            // If the condition is met, we're done!     
            var resultPromise = fn();
            resultPromise.then(function(returnedPromiseResult) {
                if (returnedPromiseResult)
                    resolve(returnedPromiseResult);
                // If the condition isn't met but the timeout hasn't elapsed, go again
                else if (Number(new Date()) < endTime) {
                    setTimeout(checkCondition, interval, resolve, reject);
                }
                // Didn't match and too much time, reject!
                else {
                    reject(new Error('PollAsync : timed out for ' + fn + ': ' + arguments));
                }

            });
        };

        return new Ext.Promise(checkCondition);
    },

    executeNCICommand: function(cmdName, cmdArguments) {
        var deferred = Ext.create('Ext.Deferred');
        InteropService.evaluateInterconnectPointMap('ConfigurationFilesClient', 'NciRSIntService').then(function(data) {
            var URL = SessionProvider.buildURL(data.WebServiceInterConnectingPointData[0].StaticData.FullURL.RelativeURL + '/ExecuteCommand');
            //"http://localhost:1337/https://d50d-sa-app01/SecureAccessMTRSInt_FM/services/NciRSIntService/ExecuteCommand"


            Ext.Ajax.request({
                url: URL,
                method: 'POST',
                jsonData: {
                    "NeName": "",
                    "ServiceType": "GenericDriver",
                    "ServiceIndex": "/",
                    "CommandName": cmdName,
                    "Arguments": cmdArguments
                },

                success: function(response) {
                    try {
                        var resp = Ext.decode(response.responseText);
                        deferred.resolve(resp);
                        console.log("executeNCICommand - returned: " + response.responseText);
                        JCoreLogger.debug("executeNCICommand - returned: " + response.responseText);
                    } catch (err) {
                        JCoreLogger.debug("executeNCICommand - failed to parse response");
                        deferred.reject();
                    }
                },
                failure: function(response) {
                    var msg = 'failed to execute executeNCICommand method';
                    if (!Ext.isEmpty(response))
                        msg += " : " + response.responseText;
                    //UNMARK IF NEEDED JCoreLogger.debug(msg);
                    JCoreLogger.error(msg);
                    deferred.reject();
                }
            }).catch(function(error) {
                //console.log(error)
                JCoreLogger.error(error)
            });
        });
        return deferred.promise;
    }


});