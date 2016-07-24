(function() {
    var TableResizing = kendo.ui.editor.TableResizing;
    var ColumnResizing = kendo.ui.editor.ColumnResizing;
    var editor;
    var tableElement;
    var tableResizing;
    var anotherTable;
    var wrapper;
    var DOT = ".";
    var FIRST_COLUMN = "td:first";
    var HANDLE_SELECTOR = ".k-resize-handle";
    var NS = "kendoEditor";
    var MAX = 123456;
    var MOUSE_DOWN = "mousedown";
    var MOUSE_ENTER = "mouseenter";
    var MOUSE_LEAVE = "mouseleave";
    var MOUSE_MOVE = "mousemove";
    var MOUSE_UP = "mouseup";
    var MOUSE_UP = "mouseup";
    var PERCENTAGE = "%";
    var PX = "px";
    var EAST = "east";
    var NORTH = "north";
    var NORTHEAST = "northeast";
    var NORTHWEST = "northwest";
    var SOUTH = "south";
    var SOUTHEAST = "southeast";
    var SOUTHWEST = "southwest";
    var WEST = "west";
    var TABLE_HTML =
        '<table id="table" class="k-table">' +
            '<tr id="row1" class="row">' +
                '<td id="col11" class="col" style="border:1px solid blue;">col 11</td>' +
                '<td id="col12" class="col" style="border:1px solid blue;">col 12</td>' +
                '<td id="col13" class="col" style="border:1px solid blue;">col 13</td>' +
            '</tr>' +
            '<tr id="row2" class="row">' +
                '<td id="col21" class="col" style="border:1px solid blue;">+col 21</td>' +
                '<td id="col22" class="col" style="border:1px solid blue;">+col 22</td>' +
                '<td id="col23" class="col" style="border:1px solid blue;">+col 23</td>' +
            '</tr>' +
            '<tr id="row3" class="row">' +
                '<td id="col31" class="col" style="border:1px solid blue;">+col 31</td>' +
                '<td id="col32" class="col" style="border:1px solid blue;">+col 32</td>' +
                '<td id="col33" class="col" style="border:1px solid blue;">+col 33</td>' +
            '</tr>' +
        '</table>';
    var NESTED_TABLE_HTML =
        '<table id="table" class="k-table">' +
            '<tr id="row1" class="row">' +
                '<td id="col11" class="col">' +
                    '<table id="nestedTable" class="k-table">' +
                        '<tr id="row1" class="row">' +
                            '<td id="col11" class="col">col 11</td>' +
                        '</tr>' +
                        '<tr id="row2" class="row">' +
                            '<td id="col21" class="col">col 21</td>' +
                        '</tr>' +
                    '</table>' +
                '</td>' +
                '<td id="col12" class="col">col 12</td>' +
                '<td id="col13" class="col">col 13</td>' +
            '</tr>' +
            '<tr id="row2" class="row">' +
                '<td id="col21" class="col">+col 21</td>' +
                '<td id="col22" class="col">+col 22</td>' +
                '<td id="col23" class="col">+col 23</td>' +
            '</tr>' +
            '<tr id="row3" class="row">' +
                '<td id="col31" class="col">+col 31</td>' +
                '<td id="col32" class="col">+col 32</td>' +
                '<td id="col33" class="col">+col 33</td>' +
            '</tr>' +
        '</table>';
    var CONTENT_HTML = '<div id="wrapper">' + TABLE_HTML + '</div>';

    function triggerEvent(element, eventOptions) {
        var options = $.extend({
            type: "mousedown",
            clientX: 0,
            clientY: 0
        }, eventOptions || {});

        $(element).trigger(options);
    }

    function triggerResize(element, from, to, options) {
        var doc = $((element[0] || element).ownerDocument.documentElement);
        var resizeHandle = $(element);
        var position = resizeHandle.position();
        var from = from || 0;
        var to = to || 0;

        triggerResizeStart(element, from, to);

        doc.trigger($.Event(MOUSE_MOVE, {
            pageX: position.left + to,
            pageY: position.top + to,
        }));
    }

    function triggerResizeStart(element, from, to) {
        var resizeHandle = $(element);
        var position = resizeHandle.position();
        var from = from || 0;
        var to = to || 0;

        resizeHandle.trigger($.Event(MOUSE_DOWN, {
            pageX: position.left + from,
            pageY: position.top + from
        }));
    }

    editor_module("editor table resizing", {
        beforeEach: function() {
            editor = $("#editor-fixture").data("kendoEditor");
            editor.tableResizing = null;
            $(editor.body).append($(CONTENT_HTML)[0]);
            $(TABLE_HTML).attr("id", "table2").appendTo(editor.body)[0];
            tableElement = $(TABLE_HTML).appendTo(QUnit.fixture)[0];
        },

        afterEach: function() {
            if (editor) {
                $(editor.body).find("*").remove();
            }
            removeMocksIn(editor.tableResizing);
            kendo.destroy(QUnit.fixture);
        }
    });

    test("hovering a table should initialize table resizing", function() {
        var table = $(editor.body).find("#table")[0];

        triggerEvent(table, { type: MOUSE_ENTER });

        ok(editor.tableResizing instanceof kendo.ui.editor.TableResizing);
    });

    test("hovering a table should initialize table resizing with table element", function() {
        var table = $(editor.body).find("#table")[0];

        triggerEvent(table, { type: MOUSE_ENTER });

        equal(editor.tableResizing.element, table);
    });

    test("hovering a table should initialize table resizing with custom options", function() {
        var table = $(editor.body).find("#table")[0];

        triggerEvent(table, { type: MOUSE_ENTER });

        equal(editor.tableResizing.options.rtl, false);
        equal(editor.tableResizing.options.rootElement, editor.body);
    });

    test("hovering a different table should destroy current table resizing", function() {
        var table = $(editor.body).find("#table")[0];
        var newTable = $(editor.body).find("#table2")[0];
        var tableResizing = editor.tableResizing = new TableResizing(table, {});
        trackMethodCall(tableResizing, "destroy");

        triggerEvent(newTable, { type: MOUSE_ENTER });

        equal(tableResizing.destroy.callCount, 1);
    });

    test("hovering the same table twice should not destroy current table resizing", function() {
        var table = $(editor.body).find("#table")[0];
        var tableResizing = editor.tableResizing = new TableResizing(table, {});
        trackMethodCall(tableResizing, "destroy");

        triggerEvent(table, { type: MOUSE_ENTER });

        equal(tableResizing.destroy.callCount, 0);
    });

    test("leaving a table should not destroy table resizing", function() {
        var table = $(editor.body).find("#table")[0];
        editor.tableResizing = new TableResizing(table, {});
        editor.tableResizing.resizingInProgress = function() { return false; };
        var mock = editor.tableResizing;
        trackMethodCall(mock, "destroy");

        triggerEvent(table, { type: MOUSE_LEAVE });

        equal(mock.destroy.callCount, 0);
        notEqual(editor.tableResizing, null);
    });

    test("leaving a table should not destroy table resizing if resizing is in progress", function() {
        var table = $(editor.body).find("#table")[0];
        editor.tableResizing = new TableResizing(table, {});
        editor.tableResizing.resizingInProgress = function() { return true; };
        trackMethodCall(editor.tableResizing, "destroy");

        triggerEvent(table, { type: MOUSE_LEAVE });

        equal(editor.tableResizing.destroy.callCount, 0);
    });

    editor_module("editor table resizing", {
        beforeEach: function() {
            editor = $("#editor-fixture").data("kendoEditor");
            editor.tableResizing = null;
            tableElement = $(NESTED_TABLE_HTML).appendTo(editor.body)[0];
        },

        afterEach: function() {
            if (editor) {
                $(editor.body).find("*").remove();
            }
            removeMocksIn(editor.tableResizing);
            kendo.destroy(QUnit.fixture);
        }
    });

    test("hovering a nested table should stop event propagation", function() {
        var nestedTable = $(tableElement).find("#nestedTable")[0];
        var enterEvent = $.Event({ type: MOUSE_ENTER });
        triggerEvent(tableElement, { type: MOUSE_ENTER });

        $(nestedTable).trigger(enterEvent);

        equal(enterEvent.isPropagationStopped(), true);
    });

    test("hovering a nested table should init new table resizing", function() {
        var nestedTable = $(tableElement).find("#nestedTable")[0];
        editor.tableResizing = new TableResizing(tableElement, {});
        triggerEvent(tableElement, { type: MOUSE_ENTER });

        triggerEvent(nestedTable, { type: MOUSE_ENTER });

        ok(editor.tableResizing instanceof kendo.ui.editor.TableResizing);
        equal(editor.tableResizing.element, nestedTable);
    });

    test("hovering a nested table should destroy current table resizing", function() {
        var nestedTable = $(tableElement).find("#nestedTable")[0];
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");

        triggerEvent(nestedTable, { type: MOUSE_ENTER });

        equal(destroySpy.calls("destroy"), 1);
    });

    test("leaving a nested table should stop event propagation", function() {
        var nestedTable = $(tableElement).find("#nestedTable")[0];
        var leaveEvent = $.Event({ type: MOUSE_LEAVE });
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        triggerEvent(nestedTable, { type: MOUSE_ENTER });

        $(nestedTable).trigger(leaveEvent);

        equal(leaveEvent.isPropagationStopped(), true);
    });

    test("leaving a nested table should init new table resizing with parent table", function() {
        var nestedTable = $(tableElement).find("#nestedTable")[0];
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        triggerEvent(nestedTable, { type: MOUSE_ENTER });

        triggerEvent(nestedTable, { type: MOUSE_LEAVE });

        ok(editor.tableResizing instanceof kendo.ui.editor.TableResizing);
        equal(editor.tableResizing.element, tableElement);
    });

    editor_module("editor table resizing", {
        beforeEach: function() {
            editor = $("#editor-fixture").data("kendoEditor");
            editor.tableResizing = null;
            tableElement = $(TABLE_HTML).appendTo(editor.body)[0];
            anotherTable = $(TABLE_HTML).attr("id", "table2").appendTo(editor.body)[0];
        },

        afterEach: function() {
            if (editor) {
                $(editor.body).find("*").remove();
            }
            removeMocksIn(editor.tableResizing);
            kendo.destroy(QUnit.fixture);
        }
    });

    test("hovering another table while resizing is in progress should not destroy current table resizing", function() {
        var enterEvent = $.Event({ type: MOUSE_ENTER });
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");
        editor.tableResizing.resizingInProgress = function() { return true; };

        $(anotherTable).trigger(enterEvent);

        equal(destroySpy.calls("destroy"), 0);
    });

    test("hovering another table while resizing is not in progress should destroy current table resizing", function() {
        var enterEvent = $.Event({ type: MOUSE_ENTER });
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");
        editor.tableResizing.resizingInProgress = function() { return false; };

        $(anotherTable).trigger(enterEvent);

        equal(destroySpy.calls("destroy"), 1);
    });

    editor_module("editor table resizing", {
        beforeEach: function() {
            editor = $("#editor-fixture").data("kendoEditor");
            editor.tableResizing = null;
            tableElement = $(TABLE_HTML).appendTo(editor.body)[0];
            anotherTable = $(TABLE_HTML).attr("id", "table2").appendTo(editor.body)[0];
        },

        afterEach: function() {
            if (editor) {
                $(editor.body).find("*").remove();
            }
            removeMocksIn(editor.tableResizing);
            kendo.destroy(QUnit.fixture);
        }
    });

    test("leaving the editor content should not destroy table resizing if resizing is in progress", function() {
        var leaveEvent = $.Event({ type: MOUSE_LEAVE });
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");
        editor.tableResizing.resizingInProgress = function() { return true; };

        $(editor.body).trigger(leaveEvent);

        equal(destroySpy.calls("destroy"), 0);
    });

    test("leaving the editor content should destroy table resizing if resizing is not in progress", function() {
        var leaveEvent = $.Event({ type: MOUSE_LEAVE });
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");
        editor.tableResizing.resizingInProgress = function() { return false; };

        $(editor.body).trigger(leaveEvent);

        equal(destroySpy.calls("destroy"), 1);
    });

    editor_module("editor table resizing", {
        beforeEach: function() {
            editor = $("#editor-fixture").data("kendoEditor");
            editor.tableResizing = null;
            tableElement = $(TABLE_HTML).appendTo(editor.body)[0];
        },

        afterEach: function() {
            if (editor) {
                $(editor.body).find("*").remove();
            }

            if (editor.tableResizing) {
                editor.tableResizing.destroy();
            }

            removeMocksIn(editor.tableResizing);
            kendo.destroy(QUnit.fixture);
        }
    });

    test("clicking on the resizing element should not destroy table resizing", function() {
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");

        triggerEvent(tableElement, { type: MOUSE_UP });

        equal(destroySpy.calls("destroy"), 0);
    });

    test("clicking on a child element should not destroy table resizing", function() {
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");

        triggerEvent($(tableElement).find(FIRST_COLUMN)[0], { type: MOUSE_UP });

        equal(destroySpy.calls("destroy"), 0);
    });

    test("clicking on the content while resizing is in progress should not destroy table resizing", function() {
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");
        editor.tableResizing.resizingInProgress = function() { return true; };

        triggerEvent(editor.body, { type: MOUSE_UP });

        equal(destroySpy.calls("destroy"), 0);
    });

    test("clicking on the content while resizing is not in progress should destroy table resizing", function() {
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");
        editor.tableResizing.resizingInProgress = function() { return false; };

        triggerEvent(editor.body, { type: MOUSE_UP });

        equal(destroySpy.calls("destroy"), 1);
    });

//table resize handles are natively supported in IE and Firefox
if (!kendo.support.browser.msie && !kendo.support.browser.mozilla) {
    test("clicking on an element with data attribute equal to table should not destroy table resizing", function() {
        triggerEvent(tableElement, { type: MOUSE_ENTER });
        var destroySpy = spy(editor.tableResizing, "destroy");
        editor.tableResizing.resizingInProgress = function() { return false; };
        editor.tableResizing.showResizeHandles();

        triggerEvent(editor.tableResizing.handles[0].element, { type: MOUSE_UP });

        equal(destroySpy.calls("destroy"), 0);
    });
}

    module("editor table resizing", {
        setup: function() {
            tableElement = $(TABLE_HTML).appendTo(QUnit.fixture)[0];
            },

        teardown: function() {
            if (tableResizing) {
                tableResizing.destroy();
            }
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should be initialized with default options", function() {
        var defaultOptions = {
            rtl: false,
            rootElement: null,
            minWidth: 50,
            minHeight: 50,
            handles: [{
                direction: EAST
            }, {
                direction: NORTH
            }, {
                direction: NORTHEAST
            }, {
                direction: NORTHWEST
            }, {
                direction: SOUTH
            }, {
                direction: SOUTHEAST
            }, {
                direction: SOUTHWEST
            }, {
                direction: WEST
            }]
        };
        tableResizing = new TableResizing(tableElement);

        deepEqual(tableResizing.options, defaultOptions);
    });

    test("should be initialized with custom options", function() {
        tableResizing = new TableResizing(tableElement, { rtl: true });

        deepEqual(tableResizing.options.rtl, true);
    });

    module("editor table resizing column resizing", {
        setup: function() {
            tableElement = $(TABLE_HTML).appendTo(QUnit.fixture)[0];
        },

        teardown: function() {
            if (tableResizing) {
                tableResizing.destroy();
            }
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should be initialized from table resizing", function() {
        tableResizing = new TableResizing(tableElement, {});

        ok(tableResizing.columnResizing instanceof kendo.ui.editor.ColumnResizing);
    });

    test("should be initialized with custom table resizing options", function() {
        var options = {
            rootElement: "element"
        };
        tableResizing = new TableResizing(tableElement, options);

        deepEqual(tableResizing.columnResizing.options.rootElement, "element");
    });

    test("should be initialized with table element", function() {
        tableResizing = new TableResizing(tableElement, {});

        equal(tableResizing.columnResizing.element, tableElement);
    });

    module("editor table resizing destroy", {
        setup: function() {
            tableElement = $(TABLE_HTML).appendTo(QUnit.fixture)[0];
            tableResizing = new TableResizing(tableElement, {});
        },

        teardown: function() {
            if (tableResizing) {
                tableResizing.destroy();
            }
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should call column resizing destroy", function() {
        var columnResizing = tableResizing.columnResizing;
        trackMethodCall(columnResizing, "destroy");

        tableResizing.destroy();

        equal(columnResizing.destroy.callCount, 1);
    });

    test("should detach event handlers", function() {
        tableResizing.destroy();

        ok(jQueryEvents(tableResizing.element) === undefined);
    });

//table resize handles are natively supported in IE and Firefox
if (!kendo.support.browser.msie && !kendo.support.browser.mozilla) {
    test("should call resize handles destroy", function() {
        var destroySpies = [];
        tableResizing.showResizeHandles();
        for (var i = 0; i < tableResizing.handles.length; i++) {
            destroySpies.push(spy(tableResizing.handles[i], "destroy"));
        }

        tableResizing.destroy();

        for (var i = 0; i < destroySpies.length; i++) {
            equal(destroySpies[i].calls("destroy"), 1);
        }
    });
}
    module("editor table resizing resizingInProgress", {
        setup: function() {
            tableElement = $(TABLE_HTML).appendTo(QUnit.fixture)[0];
            tableResizing = new TableResizing(tableElement, {});
        },

        teardown: function() {
            if (tableResizing) {
                tableResizing.destroy();
            }
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should be true while resizing columns", function() {
        var columnResizing = tableResizing.columnResizing = new ColumnResizing(tableResizing.element, {});

        columnResizing.resizable = { resizing: true, destroy: $.noop };

        equal(tableResizing.resizingInProgress(), true);
    });

    test("should be false when column resizing is stopped", function() {
        var columnResizing = tableResizing.columnResizing = new ColumnResizing(tableResizing.element, {});

        columnResizing.resizable = { resizing: false, destroy: $.noop };

        equal(tableResizing.resizingInProgress(), false);
    });

    module("editor table resizing", {
        setup: function() {
            tableElement = $(TABLE_HTML).appendTo(QUnit.fixture)[0];
            tableResizing = new TableResizing(tableElement, {
                rootElement: QUnit.fixture
            });
        },

        teardown: function() {
            if (tableResizing) {
                tableResizing.destroy();
            }
            kendo.destroy(QUnit.fixture);
        }
    });

    test("click event on editor body should be removed on destroy", function() {
        tableResizing.destroy();

        equal(jQueryEventsInfo(tableResizing.options.rootElement, "click"), undefined);
    });

    module("editor table resizing resize", {
        setup: function() {
            tableElement = $(TABLE_HTML).appendTo(QUnit.fixture)[0];
            tableResizing = new TableResizing(tableElement, {
                rootElement: QUnit.fixture
            });
        },

        teardown: function() {
            if (tableResizing) {
                tableResizing.destroy();
            }
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should call showResizeHandles()", function() {
        tableResizing.showResizeHandles();
        var showSpy = spy(tableResizing, "showResizeHandles");

        tableResizing.resize();

        equal(showSpy.calls("showResizeHandles"), 1);
    });

//table resize handles are natively supported in IE and Firefox
if (!kendo.support.browser.msie && !kendo.support.browser.mozilla) {
    module("editor table resizing resize handle", {
        setup: function() {
            tableElement = $(TABLE_HTML).appendTo(QUnit.fixture)[0];
            tableResizing = new TableResizing(tableElement, {
                rootElement: QUnit.fixture
            });
        },

        teardown: function() {
            if (tableResizing) {
                tableResizing.destroy();
            }
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should be of type TableResizeHandle", function() {
        tableResizing.showResizeHandles();
        for (var i = 0; i < tableResizing.handles.length; i++) {
            ok(tableResizing.handles[i] instanceof kendo.ui.editor.TableResizeHandle);
        }
    });

    test("should be initialized with custom options", function() {
        var customOptions = {
            appendTo: tableResizing.options.rootElement,
            direction: "east",
            resizableElement: tableResizing.element
        };

        tableResizing.showResizeHandles();

        equal(tableResizing.handles[0].options.appendTo, customOptions.appendTo);
        equal(tableResizing.handles[0].options.direction, customOptions.direction);
        equal(tableResizing.handles[0].options.resizableElement, customOptions.resizableElement);
    });

    test("should be shown on table click", function() {
        tableResizing.showResizeHandles();
        var showSpy = spy(tableResizing.handles[0], "show");

        triggerEvent(tableResizing.element, { type: "click" });

        equal(showSpy.calls("show"), 1);
    });

    test("should call resize handle show() on showResizeHandles()", function() {
        tableResizing.showResizeHandles();
        var showSpy = spy(tableResizing.handles[0], "show");

        tableResizing.showResizeHandles();

        equal(showSpy.calls("show"), 1);
    });

    test("should call resize() on resize handle drag event", function() {
        var resizeSpy = spy(tableResizing, "resize");
        tableResizing.showResizeHandles();

        triggerResize(tableResizing.handles[0].element, 0, 20);

        equal(resizeSpy.calls("resize"), 1);
    });

    test("should call resize() with deltaX argument on resize handle drag event", function() {
        var resizeSpy = spy(tableResizing, "resize");
        var deltaX = 20;
        tableResizing.showResizeHandles();

        triggerResize(tableResizing.handles[0].element, 0, deltaX);

        equal(resizeSpy.args("resize")[0]["deltaX"], deltaX);
    });

    test("should call resize() with deltaY argument on resize handle drag event", function() {
        var resizeSpy = spy(tableResizing, "resize");
        var deltaY = 30;
        tableResizing.showResizeHandles();

        triggerResize(tableResizing.handles[1].element, 0, deltaY);

        equal(resizeSpy.args("resize")[0]["deltaY"], deltaY);
    });
}
    module("editor table resizing resize width", {
        setup: function() {
            wrapper = $(CONTENT_HTML).appendTo(QUnit.fixture);
            tableElement = $(QUnit.fixture).find("#table");
            tableResizing = new TableResizing(tableElement[0], {
                rootElement: QUnit.fixture
            });
        },

        teardown: function() {
            tableResizing.destroy();
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should increase width", function() {
        var initialWidth = tableElement.width();
        var deltaX = 20;

        tableResizing.resize({ deltaX: deltaX });

        equal(tableElement.css("width"), initialWidth + deltaX + PX);
    });

    test("should decrease width", function() {
        var initialWidth = tableElement.width();
        var deltaX = 20;

        tableResizing.resize({ deltaX: (-1) * deltaX });

        equal(tableElement.css("width"), initialWidth + (-1) * deltaX + PX);
    });

    test("should change width when style width is smaller", function() {
        tableElement.css("width", "1px");
        var initialWidth = tableElement.width();
        var deltaX = 20;

        tableResizing.resize({ deltaX: deltaX });

        equal(tableElement.css("width"), initialWidth + deltaX + PX);
    });

    test("should not set width lower than min", function() {
        tableResizing.resize({ deltaX: (-1) * MAX });

        ok(parseFloat(tableElement.css("width")) >= tableResizing.options.minWidth);
    });

    test("should not set width greater than parent width", function() {
        wrapper.css("padding", "20px");

        tableResizing.resize({ deltaX: MAX });

        equal(tableElement[0].style.width, wrapper.width() + PX);
    });

    module("editor table resizing resize width in percentages", {
        setup: function() {
            wrapper = $(CONTENT_HTML).appendTo(QUnit.fixture).css("width", "400px").css("border", "1px solid red");
            tableElement = $(QUnit.fixture).find("#table").css("width", "50%");
            tableResizing = new TableResizing(tableElement[0], {
                rootElement: QUnit.fixture
            });
        },

        teardown: function() {
            tableResizing.destroy();
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should increase width", function() {
        var initialWidthInPixels = tableElement.width();
        var initialWidthInPercentages = parseFloat(tableElement[0].style.width);
        var differenceInPixels = 40;
        var differenceInPercentages = (differenceInPixels / initialWidthInPixels) * 100;

        tableResizing.resize({ deltaX: differenceInPixels });

        equal(tableElement[0].style.width, initialWidthInPercentages + differenceInPercentages + PERCENTAGE);
    });

    test("should decrease width", function() {
        var initialWidthInPixels = tableElement.width();
        var initialWidthInPercentages = parseFloat(tableElement[0].style.width);
        var differenceInPixels = 40;
        var differenceInPercentages = (differenceInPixels / initialWidthInPixels) * 100;

        tableResizing.resize({ deltaX: (-1) * differenceInPixels });

        equal(tableElement[0].style.width, initialWidthInPercentages + (-1) * differenceInPercentages + PERCENTAGE);
    });

    test("should should not be lower than min", function() {
        var initialWidthInPixels = tableElement.width();
        var minInPercentages = (tableResizing.options.minWidth / initialWidthInPixels) * 100;

        tableResizing.resize({ deltaX: (-1) * MAX });

        ok(parseFloat(tableElement[0].style.width) >= minInPercentages);
    });

    test("should should not be lower than max", function() {
        tableResizing.resize({ deltaX: MAX });

        equal(tableElement[0].style.width, "100%");
    });

    module("editor table resizing resize height", {
        setup: function() {
            wrapper = $(CONTENT_HTML).appendTo(QUnit.fixture).css("height", "800px");
            tableElement = $(QUnit.fixture).find("#table");
            tableResizing = new TableResizing(tableElement[0], {
                rootElement: QUnit.fixture
            });
        },

        teardown: function() {
            tableResizing.destroy();
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should increase height", function() {
        var initialHeight = tableElement.height();
        var deltaY = 20;

        tableResizing.resize({ deltaY: deltaY });

        equal(tableElement.css("height"), initialHeight + deltaY + PX);
    });

    test("should decrease height", function() {
        var initialHeight = tableElement.height();
        var deltaY = 20;

        tableResizing.resize({ deltaY: (-1) * deltaY });

        equal(tableElement[0].style.height, initialHeight + (-1) *  deltaY + PX);
    });
    test("should change height when style height is smaller", function() {
        tableElement.css("height", "1px");
        var initialHeight = tableElement.height();
        var deltaY = 20;

        tableResizing.resize({ deltaY: deltaY });

        equal(tableElement.css("height"), initialHeight + deltaY + PX);
    });

    test("should not set height lower than min", function() {
        tableResizing.resize({ deltaY: (-1) * MAX });

        ok(parseFloat(tableElement.css("height")) >= tableResizing.options.minHeight);
    });

    test("should not set height greater than parent height", function() {
        wrapper.outerHeight($(tableElement).outerHeight() + 20);

        tableResizing.resize({ deltaY: MAX });

        equal(tableElement.css("height"), wrapper.outerHeight() + PX);
    });

    module("editor table resizing resize height in percentages", {
        setup: function() {
            wrapper = $(CONTENT_HTML).appendTo(QUnit.fixture).css("height", "400px").css("border", "1px solid red");
            tableElement = $(QUnit.fixture).find("#table").css("height", "50%");
            tableResizing = new TableResizing(tableElement[0], {
                rootElement: QUnit.fixture
            });
        },

        teardown: function() {
            tableResizing.destroy();
            kendo.destroy(QUnit.fixture);
        }
    });

    test("should increase height", function() {
        var initialHeightInPixels = tableElement.height();
        var initialHeightInPercentages = parseFloat(tableElement[0].style.height);
        var differenceInPixels = 40;
        var differenceInPercentages = (differenceInPixels / initialHeightInPixels) * 100;

        tableResizing.resize({ deltaY: differenceInPixels });

        equal(tableElement[0].style.height, initialHeightInPercentages + differenceInPercentages + PERCENTAGE);
    });

    test("should decrease height", function() {
        var initialHeightInPixels = tableElement.height();
        var initialHeightInPercentages = parseFloat(tableElement[0].style.height);
        var differenceInPixels = 40;
        var differenceInPercentages = (differenceInPixels / initialHeightInPixels) * 100;

        tableResizing.resize({ deltaY: (-1) * differenceInPixels });

        equal(tableElement[0].style.height, initialHeightInPercentages + (-1) * differenceInPercentages + PERCENTAGE);
    });

    test("should should not be lower than min", function() {
        var initialHeightInPixels = tableElement.height();
        var minInPercentages = (tableResizing.options.minHeight / initialHeightInPixels) * 100;

        tableResizing.resize({ deltaY: (-1) * MAX });

        ok(parseFloat(tableElement[0].style.height) >= minInPercentages);
    });

    test("should should not be lower than max", function() {
        tableResizing.resize({ deltaY: MAX });

        equal(tableElement[0].style.height, "100%");
    });
})();