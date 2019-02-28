/**
 * Created by igors on 27/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.ShowFileWindow', {
    extend: 'ExtCore.ux.Dialog',
    xtype: 'show-file-window',
    requires: [],
    closeable: true,
    clickOutside: true,
    draggable: true,
    liveDrag: true,
    resizable: true,
    maximizable: true,
    constrainHeader: true,
    minWidth: 700,
    minHeight: 300,
    layout: 'fit',
    header: true,

    initComponent: function() {
        this.items = [{
                xtype: 'container',
                scrollable: false,
                flex: 1,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [{
                        xtype: 'textareafield',
                        //anchor    : '100%',
                        cls: 'nums-area',
                        itemId: 'nums-area',
                        preventScrollbars: true,
                        width: 60,
                        readOnly: true,
                        scrollable: false
                    },
                    {
                        flex: 1,
                        xtype: 'textareafield',
                        value: this.fileContent,
                        scrollable: 'y',
                        itemId: 'main-area',
                        //anchor    : '100%',
                        readOnly: true
                    }
                ]
            }

        ];
        var viewSize = Ext.getBody().getViewSize();
        this.width = viewSize.width * .8;
        this.height = viewSize.height * .8;
        //this.title = Ext.String.format('File:{1}, Folder: {0}', this.filePath, this.fileName);
        this.title = this.fileName;
        this.callParent(arguments);
    },
    listeners: {
        boxready: function() {
            var mainArea = $(this.down('#main-area').el.dom).find('textarea'),
                rowNumArea = $(this.down('#nums-area').el.dom).find('textarea');
            var scrollHeight = mainArea[0].scrollHeight,
                linesCount = this.getLinesCount(scrollHeight);
            this.fillNumbersArea(linesCount);

            rowNumArea[0].ondragenter = function() { return false; }
            rowNumArea[0].ondragstart = function() { return false; }
            rowNumArea[0].onmousedown = function() { return false; }

            mainArea[0].ondragenter = function() { return false; }
            mainArea[0].ondragstart = function() { return false; }

            mainArea.on('scroll', function(e) {
                var scrollTop = mainArea[0].scrollTop;
                //rowNumArea[0].scrollTo(0,scrollTop);
                rowNumArea[0].scrollTop = scrollTop;
            });
        }

    },
    fillNumbersArea: function(linesCount) {
        var linesArr = [],
            i;
        for (i = 1; i <= linesCount; i++) {
            linesArr.push(i);
        }
        this.down('#nums-area').setValue(linesArr.join('\n'));

    },

    getLinesCount: function(scrollHeight) {
        console.log("getLinesCount");
        var totalHeight = scrollHeight;
        var lineHeight = parseInt(this.down('#main-area').el.getStyle('line-height'), 10),
            linesCount = 0;
        if (Ext.isNumber(lineHeight) && Ext.isNumber(totalHeight) && lineHeight != 0) {
            linesCount = totalHeight / lineHeight;
        }
        return linesCount;
    }

});