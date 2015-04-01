/// <reference path="DateTime.ts" />
/// <reference path="Guid.ts" />
/// <reference path="Button.ts" />

class Card
{
    public ID: string;
    public Name: string;
    public Description: string;
    public Milliseconds: number;
    public Order: number;

    public ListID: string;

    constructor(source: any = null)
    {
        for (var prop in source) this[prop] = source[prop];
    }

    static InitializeComponent(): void
    {
        $(document).on("click", ".cardlist .action-add", function (e)
        {
            var name;

            if (!(name = prompt("Name")))
                return;

            var cardList = $(this).closest(".cardlist").find(".drop-area");

            var card = new Card();
            card.ListID = $(this).closest(".list").data("id");
            card.Name = name;
            card.Description = "Test";
            card.Milliseconds = 0;
            card.Order = cardList.find(".card").length;

            card.AddOrUpdate();

            cardList.append(card.To$());
        });

        $(window).on("beforeunload", function (e)
        {
            if ($(".card .time").filter(function (e) { return $(this).data("started"); }).length)
            {
                return "There are running timers.";
            }
        });

        $(function ()
        {
            var cards = Card.Load().AsLinq<Card>()
                .OrderBy(o => o.Order)
                .ToArray();

            $.each(cards, function (i, e)
            {
                var card = new Card(e);

                $(".list").filter(function (ix, o)
                {
                    return $(o).data("id") == card.ListID;
                }).find(".cardlist .drop-area").append(card.To$());
            });
        });
    }

    static GetStorage(): any
    {
        return JSON.parse(localStorage.getItem("Cards")) || {};
    }

    static Load(): Card[]
    {
        var cardsObject = Card.GetStorage();
        var cardsList: Card[] = [];

        for (var i in cardsObject)
        {
            cardsList.push(cardsObject[i]);
        }

        return cardsList;
    }

    static Save(cards: any): void
    {
        if (cards instanceof Array)
        {
            var cardsHash = {};
            $.each(cards, function (i, c)
            {
                cardsHash[c.ID] = c;
            });
            cards = cardsHash;
        }

        localStorage.setItem("Cards", JSON.stringify(cards));
    }

    public AddOrUpdate(): void
    {
        var cards = Card.GetStorage();

        if (!this.ID)
        {
            do
            {
                this.ID = Guid.NewGuid();
            } while (cards[this.ID]);
        }

        console.log(this);
        cards[this.ID] = this;

        Card.Save(cards);
    }

    public Remove(): void
    {
        var cards = Card.GetStorage();

        delete cards[this.ID];

        Card.Save(cards);
    }

    public To$(): JQuery
    {
        var self = this;

        var card = $("<div>")
            .addClass("card")
            .data("id", self.ID);

        var name = $("<span>")
            .addClass("title col-md-10")
            .attr("title", this.Name)
            .append(this.Name);

        name.click(function ()
        {
            var nameInput;

            if (!(nameInput = prompt("Name", self.Name)))
                return;

            name.html(nameInput);

            self.Name = nameInput;
            self.AddOrUpdate();
        });

        var timeButton = new Button();
        timeButton.Image = "time";
        timeButton.Class = "btn-default btn-xs time";
        timeButton.Text = DateTime.Format(this.Milliseconds);
        timeButton.Data = { "ms": this.Milliseconds };
        timeButton.Command = function (e)
        {
            var started = $(this).data("started");

            started = new Date(started);

            if (isNaN(started.valueOf()) || !started.getTime())
            {
                started = null;
            }

            var ms = parseInt($(this).data("ms"));
            if (isNaN(ms))
            {
                ms = 0;
            }

            var updateInterval;
            if (started)
            {
                $(this).css("background", "");
                updateInterval = $(this).data("updateInterval");
                clearInterval(updateInterval);
                $(this).removeData("updateInterval");

                var diff = new Date().getTime() - started.getTime();
                ms += diff;

                $(this).data("ms", ms);
                $(this).removeData("started");

                $(this).find(".result").html(DateTime.Format(ms));

                var card = Card.Load().AsLinq<Card>().FirstOrDefault(o => o.ID == self.ID);
                if (card)
                    card = new Card(card);

                card = card || self;

                self.Milliseconds = ms;
                card.Milliseconds = ms;
                card.AddOrUpdate();

                console.log("Total ms: ", ms, DateTime.Format(ms));
            }
            else
            {
                started = new Date();
                $(this).css("background", "#FFFF3E");
                $(this).data("started", started.getTime());

                updateInterval = setInterval(() =>
                {
                    var diff = new Date().getTime() - started.getTime();
                    $(this).find(".result").html(DateTime.Format(diff + ms));
                });

                $(this).data("updateInterval", updateInterval);
            }
        };

        var deleteButton = new Button();
        deleteButton.Image = "remove";
        deleteButton.Class = "btn-default btn-xs";
        deleteButton.Command = function (e)
        {
            var confirmationMessage = "Are you sure you want to delete '" + self.Name + "'?"
                + "\n"
                + "Recorded time: " + DateTime.Format(self.Milliseconds);
            if (!confirm(confirmationMessage))
                return;

            self.Remove();

            var updateInterval = $(this).closest(".card").find(".time").data("updateInterval");
            clearInterval(updateInterval);

            $(this).closest(".card").remove();
        };

        var wrap = $("<div>")
            .addClass("row");

        wrap.append(deleteButton.To$().wrap("<div>").parent().addClass("pull-right remove"));
        wrap.append(name);

        card.append(wrap);

        card.append(timeButton.To$().wrap("<div>").parent());

        card.draggable(
            {
                cursor: "move",
                revert: "invalid",
                connectToSortable: ".cardlist .drop-area"
            });

        return card;
    }
}

$(function ()
{
    Card.InitializeComponent();
});