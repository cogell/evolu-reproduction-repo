# Cocktail Ingredients Table

## Option Chosen: Good Enough

I chose the option that was good enough for now. I went with the simple table. I can always refactor later if I need to.

And recently bias, from reading ['Good Enough' is Good Enough](https://ep2013.europython.eu/conference/talks/good-enough-is-good-enough) by Alex Martelli, probably tipped the scale.

## Options Considered: simple table, JSON column, normalized tables, Abuse Units

help me consider the tradeoffs of 3 design choices for the relational database for the cocktail app Im making.
some setup:

there will be a table for cocktails, a table for ingredients, and table combining the two cocktail_ingredients.

### Simple Table

the cocktail_ingredients table has columns for amount, unit, isGarnish, isToTopOff. this is easy but doesnt reflect reality. there will never be a isGarnish true that will also have isToTopOff true, and generally if either isGarnish or isToTopOff true, then amount and unit will be null.

### Json Column

the cocktail_ingredients table stores json in one column where the json either has the shape of amount and unit OR only isGarnish OR only isToTopOff. this is nice since it better reflects reality. but we loose some sql query abilities on that data.

### Normalized Tables

we actually make some new tables, so we'd have cocktail_ingredients, cocktail_garnishes, and cocktail_toppers. this captures reality in the db. but is a bit more work upfront.
please walk me thru step by step your realizing about each one to help me make a choice as to which path I should take

[claude's response](https://claude.ai/chat/ee27b8b2-973a-4dc2-9381-881db804192e) wasnt particularly helpful, tho writing out my options was.

> Ultimately, the choice depends on your specific requirements, priorities, and the scale of your cocktail app. Consider factors such as the expected growth of the app, the complexity of queries you anticipate, and the development time and resources available to you.

## Abuse Units

I could also abuse the unit column to store special things like "garnish" or "to top" or "rinse". These units would could be configured to have NO amount.

## Musings

- theres a connection here between the flexability of the UI and the flexibility of the db schema.
- cause when displaying ingredients on the `cocktail/:id` page, I want to group all the garnishes together, and all the toppers together.
- so I need to reliably query for garnishes
- to do this with special units would be to imbue the unit table with columns that affected the UI
- like "hasAmmount" or "gatherInGroup" or "groupLabel"

- if I make special units like that then the app is more flexible in the future
- if I hardcode meanings like "isGarnish" or "isToTopOff" then the app is less flexible in the future
- BUT do I need this flexibility?

re showing/hiding amounts in ui -> having `can have amount` in unit table is good enough (accepting the redundancy of amount: null in cocktail_ingredients table)

re grouping ingredients in ui -> having `gatherInGroup` in unit table is good enough

garnish is so special it could still be considered for "isGarnish" in cocktail_ingredients table

- possible future idea:
  - lemon is the ingredient
  - wedge is the unit
  - garnish is the conditional flag
- possible future idea, handling lemon juice
  - lemon is the ingredient
  - ounces is the unit
