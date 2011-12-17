/**
 * jqWindow tests
 *
 * @author Julia Loykova
 * @since 12.12.11
 */
module('Core');
test('$.jqWindow()', function() {
    expect(2);
    ok($.jqWindow(), 'Возвращает значение');
    ok($('.test').jqWindow(), 'Возвращает значение');
});
test('$.jqWindowManager()', function() {
    expect(2);
    ok($.jqWindowManager(), 'Возвращает значение');
    ok($('.test').jqWindowManager(), 'Возвращает значение');
});