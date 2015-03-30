/// <reference path="Linq.ts" />

class CardList
{
    public ID: string;
    public Name: string;
    public Order: number;

    constructor(source: any = null)
    {
        for (var prop in source) this[prop] = source[prop];
    }

    static InitializeComponent(): void
    {
        function DropAreaEvents()
        {
            $(".drop-area")
                .sortable(
                {
                    items: ".card",
                    connectWith: ".drop-area",
                    receive: function (event, ui)
                    {
                        var cardID = ui.item.data("id");

                        if (cardID)
                        {
                            var listID = $(this).closest(".list").data("id");

                            var index = ui.item.index();

                            var cards = Card.Load();

                            var card = cards.AsLinq<Card>().Single(o => o.ID == cardID);

                            card.ListID = listID;
                            card.Order = index;

                            new Card(card).AddOrUpdate();

                            var order = 0;
                            cards = Card.Load().AsLinq<Card>()
                                .OrderBy(o => o.Order)
                                .Select(o => 
                            {
                                if (o.ListID == listID && o.ID != card.ID)
                                {
                                    if (order == index)
                                    {
                                        ++order;
                                    }

                                    o.Order = order;
                                    ++order;
                                }

                                return new Card(o);
                            }).ToArray();

                            Card.Save(cards);
                        }
                    }
                })
                .droppable(
                {
                    accept: ".card",
                    activeClass: "accept-drop-started"
                });
        }

        $(document).on("click", ".lists-menu .action-add", function (e)
        {
            var title;

            if (!(title = prompt("Title")))
                return;

            var container = $(".cardlist-container");

            var cardList = new CardList();
            cardList.Name = title;

            cardList.AddOrUpdate();

            container.append(cardList.To$());

            $(".drop-area.ui-sortable[data-ui-sortable]").sortable("destroy");
            $(".drop-area.ui-droppable[data-ui-droppable]").sortable("destroy");
            DropAreaEvents();
        });

        $(function ()
        {
            var cardLists = CardList.Load();

            $.each(cardLists, function (i, e)
            {
                var cardList = new CardList(e);
                $(".cardlist-container").append(cardList.To$());
            });

            DropAreaEvents();
        });
    }


    public Save(cardLists: any): void
    {
        localStorage.setItem("CardLists", JSON.stringify(cardLists));
    }

    public AddOrUpdate(): void
    {
        var cardLists = CardList.GetStorage();

        if (!this.ID)
        {
            do
            {
                this.ID = Guid.NewGuid();
            } while (cardLists[this.ID]);
        }

        cardLists[this.ID] = this;

        this.Save(cardLists);
    }

    public Remove(): void
    {
        var self = this;

        var cardLists = CardList.GetStorage();
        var cards = Card.Load();

        cards.AsLinq<Card>()
            .Where(o => o.ListID == self.ID)
            .ForEach((e, i) =>
        {
            new Card(e).Remove();
        });

        delete cardLists[this.ID];

        this.Save(cardLists);
    }

    static GetStorage(): any
    {
        return JSON.parse(localStorage.getItem("CardLists")) || {};
    }

    static Load(): CardList[]
    {
        var cardListsObject = CardList.GetStorage();
        var cardListsList: CardList[] = [];

        for (var i in cardListsObject)
        {
            cardListsList.push(cardListsObject[i]);
        }

        return cardListsList;
    }

    public To$(): JQuery
    {
        var self = this;

        var cardListContainer = $("<div>")
            .addClass("list")
            .data("id", self.ID);

        var cardList = $("<div>")
            .addClass("accept-droppable cardlist");

        var listName = $("<h4>")
            .addClass("list-name")
            .html(this.Name);

        listName.click(function ()
        {
            var nameInput;

            if (!(nameInput = prompt("Name", self.Name)))
                return;

            listName.html(nameInput);

            self.Name = nameInput;
            self.AddOrUpdate();
        });

        var headerContainer = $("<div>").addClass("header");
        var buttonContainer = $("<div>").addClass("list-actions pull-right");

        var addCardButton = new Button();
        addCardButton.Class = "btn-default btn-xs action-add";
        addCardButton.Image = "plus";
        addCardButton.Text = "Add";

        var deleteButton = new Button();
        deleteButton.Class = "btn-default btn-xs action-remove";
        deleteButton.Image = "remove";
        deleteButton.Command = function (e)
        {
            var confirmationMessage = "Are you sure you want to delete '" + self.Name + "'?"
                + "\nAll cards in this list will be lost.";
            if (!confirm(confirmationMessage))
                return;

            self.Remove();

            var timers = $(this).find(".time");

            timers.each(function (i, e)
            {
                var updateInterval = $(this).data("updateInterval");
                clearInterval(updateInterval);
            });

            $(this).closest(".list").remove();
        };

        var dropArea = $("<div>")
            .addClass("drop-area");

        buttonContainer.append(addCardButton.To$());
        buttonContainer.append(deleteButton.To$());

        headerContainer.append(buttonContainer);
        headerContainer.append(listName);

        cardList.append(headerContainer);
        cardList.append(dropArea);

        cardListContainer.append(cardList);

        return cardListContainer;
    }
}

CardList.InitializeComponent();