var DateTime = (function () {
    function DateTime() {
    }
    DateTime.Format = function (ms) {
        var milliseconds = ms % 1000;
        var seconds = Math.floor((ms / 1000) % 60);
        var minutes = Math.floor((ms / (60 * 1000)) % 60);
        var hours = Math.floor((ms / (60 * 60 * 1000)) % 60);
        return ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2) + "." + milliseconds;
    };
    return DateTime;
})();
var App = (function () {
    function App() {
    }
    App.OnLoaded = function () {
        $(function () {
            $(".card").draggable({
                cursor: "move",
                revert: "invalid",
                connectToSortable: ".cardlist"
            });
            $(".cardlist").sortable({ items: "div:not(.placeholder)" });
            $(".action-time").click(function () {
                var started = $(this).data("started");
                started = new Date(started);
                if (isNaN(started.valueOf()) || !started.getTime()) {
                    started = null;
                }
                var ms = parseInt($(this).data("ms"));
                if (isNaN(ms)) {
                    ms = 0;
                }
                if (started) {
                    $(this).css("background", "");
                    var diff = new Date().getTime() - started.getTime();
                    ms += diff;
                    $(this).data("ms", ms);
                    $(this).data("started", null);
                    $(this).find(".result").html(DateTime.Format(ms));
                    console.log("Total ms: ", ms, DateTime.Format(ms));
                }
                else {
                    $(this).css("background", "green");
                    $(this).data("started", new Date().getTime());
                }
            });
            $(".action-remove").click(function () {
                $(this).closest(".card").remove();
            });
        });
    };
    return App;
})();
App.OnLoaded();
//# sourceMappingURL=app.js.map