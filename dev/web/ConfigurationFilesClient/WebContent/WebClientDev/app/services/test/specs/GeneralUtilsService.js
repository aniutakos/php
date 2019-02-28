describe('GetArrayAsString', function() {

    it('GetArrayAsString base values', function() {

        expect(GeneralUtilsService.GetArrayAsString(null)).toBe(null);

        expect(GeneralUtilsService.GetArrayAsString("not an array")).toBe(null);

        expect(GeneralUtilsService.GetArrayAsString([1, 2, 3], false)).toBe("1,2,3");

        expect(GeneralUtilsService.GetArrayAsString([1, 2, 3], true)).toBe('"1,2,3"');
    });
});