describe('BackupOperationsIndexerService Tests', function() {

    beforeEach(function() {
        BackupOperationsIndexerService.ResetData();

        spyOn(BackupOperationsIndexerService, 'GetSessionId').and.returnValue(1234);

        spyOn(BackupOperationsIndexerService, 'fireEvent').and.returnValue(null);
    });


    it('AddNewOperation_withSeveralAddedNes_ReturnsSameExecutionIdForAll', function() {

        BackupOperationsIndexerService.AddNewOperation([111, 222, 333]);

        expect(BackupOperationsIndexerService.GetExecutionId(111)).toEqual(BackupOperationsIndexerService.GetExecutionId(222));
        expect(BackupOperationsIndexerService.GetExecutionId(111)).toEqual(BackupOperationsIndexerService.GetExecutionId(333));
    });

    it('GeneralFunctionality_addAndRemoveOperations_FunctionsAsExpected', function() {

        var numOfOperations = BackupOperationsIndexerService.GetNumOfActiveBackupOperations();
        expect(numOfOperations).toBe(0);

        BackupOperationsIndexerService.AddNewOperation(11111);
        numOfOperations = BackupOperationsIndexerService.GetNumOfActiveBackupOperations();
        expect(numOfOperations).toBe(1);

        BackupOperationsIndexerService.AddNewOperation(22222);
        numOfOperations = BackupOperationsIndexerService.GetNumOfActiveBackupOperations();
        expect(numOfOperations).toBe(2);

        BackupOperationsIndexerService.RemoveOperation(11111);
        numOfOperations = BackupOperationsIndexerService.GetNumOfActiveBackupOperations();
        expect(numOfOperations).toBe(1);
    });

    it('AddNewOperation_addingSameNeTwice_replacesPreviousData', function() {

        BackupOperationsIndexerService.AddNewOperation(11111);
        var numOfOperations = BackupOperationsIndexerService.GetNumOfActiveBackupOperations();
        expect(numOfOperations).toBe(1);

        var operationData = Ext.clone(BackupOperationsIndexerService.GetOperationData(11111));

        BackupOperationsIndexerService.AddNewOperation(11111);
        numOfOperations = BackupOperationsIndexerService.GetNumOfActiveBackupOperations();
        expect(numOfOperations).toBe(1);

        expect(operationData == BackupOperationsIndexerService.GetOperationData(11111)).toBe(false);
    });

    it('CreateUniqueId_runTwice_returnsDifferentResults', function() {

        var id1 = BackupOperationsIndexerService.CreateUniqueId();
        var id2 = BackupOperationsIndexerService.CreateUniqueId();

        expect(id1 == id2).toBe(false);
    });

    it('AddNewOperation_withAddedNe_setsCycleLevelOfNeToOne', function() {

        BackupOperationsIndexerService.AddNewOperation(11111);

        var data = BackupOperationsIndexerService.GetOperationData(11111);

        expect(data.cycleLevel == 1).toBe(true);

    });

    it('SetCycleLevel_withGivenNe_changesCycleLevelOfNe', function() {

        BackupOperationsIndexerService.AddNewOperation(11111);

        BackupOperationsIndexerService.SetCycleLevel(11111, 2);

        var data = BackupOperationsIndexerService.GetOperationData(11111);

        expect(data.cycleLevel == 2).toBe(true);
    });

    it('GetAllActiveOperationsNeIds_withGivenCycleLevel_returnsMatchingNumOfNes', function() {

        BackupOperationsIndexerService.AddNewOperation(11111);

        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds().length).toEqual(1);
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds(1).length).toEqual(1);
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds(2).length).toEqual(0);

        BackupOperationsIndexerService.AddNewOperation(22222);

        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds().length).toEqual(2);
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds(1).length).toEqual(2);
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds(2).length).toEqual(0);

        BackupOperationsIndexerService.SetCycleLevel(11111, 2);

        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds().length).toEqual(2);
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds(1).length).toEqual(1);
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds(2).length).toEqual(1);
    });

});