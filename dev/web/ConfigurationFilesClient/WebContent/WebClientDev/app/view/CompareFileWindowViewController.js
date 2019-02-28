Ext.define('ConfigurationFilesClient.view.CompareFilesWindowViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.compare-files-window-view-controller',

    compareFiles: function () {
        var me = this;

        var store = Ext.create('Ext.data.Store', {});
        var vm = me.getViewModel();
        var fileOne = vm.get('compareFile1Contents').split(/\r\n|\r|\n/);
        var fileTwo = vm.get('compareFile2Contents').split(/\r\n|\r|\n/);

//        var fileOneDetails = vm.get('compareFile1');
//        var fileTwoDetails = vm.get('compareFile2');

        var comparator = new difflib.Differ();
        var compareResult = comparator.compare(fileOne, fileTwo);

        me.original = { "lineNumber": 0 };
        me.changed = { "lineNumber": 0 };

        me.addCompareDataToStore(compareResult, store);
        me.getGrid().setStore(store);
        //me.addTableTitle(fileOneDetails.data.FileName, fileTwoDetails.data.FileName);

        //me.buildTableInChunks(compareResult, compareResult.length);
    },

    getGrid: function()
    {
        return this.getView().down('gridpanel');
    },

    focusNextChange: function () {
        var me = this;
        me.focusChange(true);
    },

    focusPreviousChange: function () {
        var me = this;
        me.focusChange(false);
    },

    focusChange: function (isNext) {
        var me = this;
        var grid = me.getGrid();
        var vm = me.getViewModel();

        var currentFocusedLine = vm.get('currentFocusedLine');
        var LinesToJump = vm.get('LinesToJump');

        if (LinesToJump.length == 0) {
            return;
        }
        if (currentFocusedLine == null) {
            grid.setFocused(LinesToJump[0]);
            vm.set('currentFocusedLine', LinesToJump[0]);
            return;
        }
        var indx = LinesToJump.indexOf(currentFocusedLine);
        if (indx != null) {
            if (isNext) {
                if (indx < LinesToJump.length - 1) {
                    grid.setFocused(LinesToJump[indx + 1]);
                    grid.getView().getNode(LinesToJump[indx + 1]).scrollIntoView();
                    vm.set('currentFocusedLine', LinesToJump[indx + 1]);
                }
                else {
                    grid.setFocused(LinesToJump[indx]);
                    grid.getView().getNode(LinesToJump[indx]).scrollIntoView();
                }
            }

            if (!isNext) {
                if (indx > 0) {
                    grid.setFocused(LinesToJump[indx - 1]);
                    grid.getView().getNode(LinesToJump[indx - 1]).scrollIntoView();
                    vm.set('currentFocusedLine', LinesToJump[indx - 1]);
                }
                else{
                    grid.setFocused(LinesToJump[0]);
                    grid.getView().getNode(LinesToJump[0]).scrollIntoView();
                }
            }
        }
    },

    addCompareDataToStore: function (compareResult, store) {
        var me = this;

        var changedLinesNum = 0,
            deletedLinesNum = 0,
            addedLinesNum = 0,
            LinesToJump = [],
            gridRowNum = 0;

        var vm = me.getViewModel();
        var rowVal1 = '';
        var rowVal2 = '';
        for (var i = 0; i < compareResult.length; i++) {
            //for (var i = 0; i < 50; i++) {

            rowVal1 = compareResult[i].substring(1, compareResult[i].length);
            switch (compareResult[i].charAt(0)) {
                case ' ':
                    me.original.text = rowVal1;
                    me.changed.text = rowVal1;
                    me.original.lineNumber = me.original.lineNumber + 1;
                    me.changed.lineNumber = me.changed.lineNumber + 1;
                    me.original.lineStyle = 'whiteCell';
                    me.addRow(me.original, me.changed, '', gridRowNum, store);
                    gridRowNum ++;

                    break;
                case '?':
                    break;

                case '-':
                    if (compareResult[i + 1]) {
                        if (compareResult[i + 1].charAt(0) == '?') {
                            compareResult.splice(i + 1, 1);
                        }
                        if (compareResult[i + 1].charAt(0) == '+') {
                            rowVal2 = compareResult[i + 1].substring(1, compareResult[i + 1].length);
                            comparator = new difflib.SequenceMatcher(null, rowVal1, rowVal2);
                            if (comparator.quickRatio() > 0.5) {
                                me.original.text = rowVal1;
                                me.original.lineNumber = me.original.lineNumber + 1;
                                me.changed.text = rowVal2;
                                me.changed.lineNumber = me.changed.lineNumber + 1;
                                changedLinesNum++;
                                LinesToJump.push(gridRowNum);
                                me.addRow(me.original, me.changed, '?', gridRowNum, store);
                                gridRowNum++;
                                i++;
                                continue;
                            }
                        }
                    }
                    me.original.text = rowVal1;
                    me.original.lineNumber = me.original.lineNumber + 1;
                    me.changed.text = '';

                    deletedLinesNum++;
                    LinesToJump.push(gridRowNum);
                    me.addRow(me.original, me.changed, '-', gridRowNum, store);
                    gridRowNum++;
                    break;
                case '+':
                    if (compareResult[i + 1]) {
                        if (compareResult[i + 1].charAt(0) == '?') {
                            compareResult.splice(i + 1, 1);
                        }
                        if (compareResult[i + 1].charAt(0) == '-') {
                            rowVal2 = compareResult[i + 1].substring(1, compareResult[i + 1].length);
                            comparator = new difflib.SequenceMatcher(null, rowVal1, rowVal2);
                            if (comparator.quickRatio() > 0.5) {
                                me.original.text = rowVal2;
                                me.original.lineNumber = me.original.lineNumber + 1;
                                me.changed.lineNumber = me.changed.lineNumber + 1;
                                me.changed.text = rowVal1;
                                changedLinesNum++;
                                LinesToJump.push(gridRowNum);
                                me.addRow(me.original, me.changed, '?', gridRowNum, store);
                                gridRowNum++;
                                i++;
                                continue;
                            }
                        }
                    }
                    me.original.text = '';
                    me.changed.lineNumber = me.changed.lineNumber + 1;
                    me.changed.text = rowVal1;
                    addedLinesNum++;
                    LinesToJump.push(gridRowNum);
                    me.addRow(me.original, me.changed, '+', gridRowNum, store);
                    gridRowNum++;

                    break;
            }
        }

        vm.set('changedLinesNum', changedLinesNum);
        vm.set('deletedLinesNum', deletedLinesNum);
        vm.set('addedLinesNum', addedLinesNum);
        vm.set('LinesToJump', LinesToJump);
        if(LinesToJump.length==0){
            vm.set('isNoChanges', true);
        }
        else{
            vm.set('isNoChanges', false);
        }

    },
  
    addRow: function (original, changed, status, indx, store) {
        var record = {
            id: indx,
            originalLineNumber: original.lineNumber,
            changedLineNumber: changed.lineNumber,
            originalText: original.text,
            changedText: changed.text,
            status: status
        };

        store.add(record);
    }

});