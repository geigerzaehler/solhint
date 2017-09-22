const assert = require('assert');
const linter = require('./../lib/index');
const { funcWith, contractWith } = require('./contract-builder');


describe('Linter', function() {
    describe('Indent Rules', function () {

        it('should raise error when contract do not surrounds with two blank lines', function () {
            const code = `
            contract A {}
            
            contract B {}
            `;

            const report = linter.processStr(code, config());

            assert.equal(report.errorCount, 2);
            assert.ok(report.messages[0].message.includes('two blank'));
        });

        it('should not raise error when contract do not surrounds with two blank lines', function () {
            const code = `
            contract A {}
            
            
            contract B {}
            
            
            contract C {}
            `;

            const report = linter.processStr(code, config());

            assert.equal(report.errorCount, 0);
        });

        it('should raise error about mixed tabs and spaces', function () {
            const code = ' \t import "lib.sol";';

            const report = linter.processStr(code, config());

            assert.equal(report.errorCount, 1);
            assert.ok(report.messages[0].message.includes('Mixed tabs and spaces'));
        });

        it('should raise error when line indent is incorrect', function () {
            const code = '\t\timport "lib.sol";';

            const report = linter.processStr(code, {rules: { indent:['error', 'tabs'] } });

            assert.equal(report.errorCount, 1);
            assert.ok(report.messages[0].message.includes('indent'));
        });

        it('should raise error when line indent is incorrect', function () {
            const code = '\t\timport "lib.sol";';

            const report = linter.processStr(code, {rules: { indent:['error', 'tabs'] } });

            assert.equal(report.errorCount, 1);
            assert.ok(report.messages[0].message.includes('indent'));
        });

        it('should raise error when line indent is incorrect', function () {
            const code = '\n'
                + '    contract A {\n'
                + '        uint private a;\n'
                + '    }\n';

            const report = linter.processStr(code);

            assert.equal(report.errorCount, 3);
            assert.ok(report.messages[0].message.includes('0'));
            assert.ok(report.messages[1].message.includes('4'));
            assert.ok(report.messages[2].message.includes('0'));
        });

        it('should raise error when line indent is incorrect for function', function () {
            const code = '\n'
                + '    contract A {\n'
                + '        uint private a;\n'
                + '        function A() private { \n'
                + '      }\n'
                + '    }\n';

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assert.equal(report.errorCount, 5);
            assert.ok(report.messages[0].message.includes('Expected indentation of 0'));
            assert.ok(report.messages[1].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[2].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[3].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[4].message.includes('Expected indentation of 0'));
        });

        it('should raise error when line indent is incorrect for function with for loop', function () {
            const code = '\n'                           // 1
                + '    contract A {\n'                  // 2
                + '        uint private a;\n'           // 3
                + '        function A() private { \n'   // 4
                + '    for (uint a; a < b; a += 1) \n'  // 5
                + '            break; \n'               // 6
                + '      }\n'                           // 7
                + '    }\n';                            // 8

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assert.equal(report.errorCount, 6);
            assert.ok(report.messages[0].message.includes('Expected indentation of 0'));
            assert.ok(report.messages[1].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[2].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[3].message.includes('Expected indentation of 8'));
            assert.ok(report.messages[4].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[5].message.includes('Expected indentation of 0 spaces'));
        });

        it('should raise error when line indent is incorrect for function with for while loop', function () {
            const code = '\n'                           // 1
                + '    contract A {\n'                  // 2
                + '        uint private a;\n'           // 3
                + '        function A() private { \n'   // 4
                + '    while (a < b) \n'                // 5
                + '            return; \n'              // 6
                + '      }\n'                           // 7
                + '    }\n';                            // 8

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assert.equal(report.errorCount, 6);
            assert.ok(report.messages[0].message.includes('Expected indentation of 0 spaces'));
            assert.ok(report.messages[1].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[2].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[3].message.includes('Expected indentation of 8'));
            assert.ok(report.messages[4].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[5].message.includes('Expected indentation of 0'));
        });

        it('should raise error when line indent is incorrect for function with for if statement', function () {
            const code = '\n'                           // 1
                + '    contract A {\n'                  // 2
                + '        uint private a;\n'           // 3
                + '        function A() private { \n'   // 4
                + '    if (a < b) {\n'                  // 5
                + '            a += 1; \n'              // 6
                + '        b -= 1; \n'                  // 7
                + '            continue; \n'            // 8
                + '        } \n'                        // 9
                + '      }\n'                           // 10
                + '    }\n';                            // 11

            const report = linter.processStr(code, {rules: {'separate-by-one-line-in-contract': false}});

            assert.equal(report.errorCount, 7);
            assert.ok(report.messages[0].message.includes('Expected indentation of 0 spaces'));
            assert.ok(report.messages[1].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[2].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[3].message.includes('Expected indentation of 8'));
            assert.ok(report.messages[4].message.includes('Expected indentation of 12'));
            assert.ok(report.messages[5].message.includes('Expected indentation of 4'));
            assert.ok(report.messages[6].message.includes('Expected indentation of 0'));
        });

        it('should not raise error for custom configured indent rules', function () {
            const code = '\n' +
                'contract A {\n' +
                '\tuint private a = 0;\n' +
                '\tfunction A() {\n' +
                '\t\t\tuint a = 5;\n' +
                '\t}\n' +
                '}';

            const report = linter.processStr(code, {
                rules: {
                    indent: ['warn', 'tabs'],
                    'func-visibility': false,
                    'separate-by-one-line-in-contract': false
                }
            });

            assert.equal(report.warningCount, 1);
            assert.ok(report.messages[0].message.includes('Expected indentation of 2 tabs'));
        });

        it('should raise error when bracket incorrect aligned', function () {
            const code = funcWith(`
                for (uint i = 0; i < a; i += 1) 
                {
                  continue;
                }
            `);

            const report = linter.processStr(code, config());

            assert.equal(report.errorCount, 1);
            assert.ok(report.messages[0].message.includes('Open bracket'));
        });

        it('should raise error when array declaration has spaces', function () {
            const code = contractWith('uint [] [] private a;');

            const report = linter.processStr(code, config());

            assert.equal(report.errorCount, 2);
            assert.ok(report.messages[0].message.includes('Array declaration'));
            assert.ok(report.messages[0].message.includes('Array declaration'));
        });

        it('should not raise error for array declaration', function () {
            const code = contractWith('uint[][] private a;');

            const report = linter.processStr(code, config());

            assert.equal(report.errorCount, 0);
        });

        it('should raise error when items inside contract do not separated by new line', function () {
            const code = contractWith(`
                function a() public {
                }
                function b() public {}
            `);

            const report = linter.processStr(code, config());

            assert.equal(report.errorCount, 1);
            assert.ok(report.messages[0].message.includes('must be separated by one line'));
        });

        it('should raise error when line length exceed 120', function () {
            const code = ' '.repeat(121);

            const report = linter.processStr(code, config());

            assert.equal(report.errorCount, 1);
            assert.ok(report.messages[0].message.includes('Line length must be no more than'));
        });

        it('should not raise error when line length exceed 120 and custom config provided', function () {
            const code = ' '.repeat(130);

            const report = linter.processStr(code, {
                rules: { indent: false, 'max-line-length': ['error', 130] }
            });

            assert.equal(report.errorCount, 0);
        });

    });

    function config() {
        return {
            rules: { indent: false }
        };
    }
});