## Behavioral Driven Development Testing, A Case Study

(Read time 4 minutes TODO: (at 1000 WPS) $$calculateWPM$$)

I first encountered BDD at a shipping company that starts with a u, sometime in 2013.

## SpecFlow

We were using SpecFlow (Cucumber for .Net) to allow for Gherkin tests, and had an excellent technical QA (one step down from a SDET) who became the main one who wrote and owned all the spec flow steps.

The team:
* A very technical product manager
* A very technical QA
* A very technical team (it was the API team so no real UI, and few stakeholders who were not technical)

What went well:
* We got into a grove where our QA would start on building out SpecFlow tests for the tickets as soon as a sprint started
* This was possible because being an API team, nailing down the external contracts was done pretty early, and the limitations of JSON cause it to not be implemented in alternative ways without changing the contract (as opposed to a UI mockup, classes/ids/elemnts can be done in infinite ways)
* So when the ticket was moved to the QA column, he would point the test to that branch of code and sometimes within minutes say "Your implementaition is failing these test cases, heres a link to the tests so you can run them yourself"
* Once it passed the BDD tests, he would then bother testing with real data and within a full larger process
* We built a parallel test runner to improve the wall clock time of the test runs, I was heavily involved in that which was fun

What could be improved:
* In the long run **only** the QA or the developers wrote any gherkin or specflow steps
* Specifically I created some overly complex tests (such as pulling data through the webpage version using Selenium then pulling data through the API, and comparing that the data all matched, as well as translated correctly)
* I also created some steps that would be able to send a GET request, then apply a modification to the json response, use that modified version to PUT, and then make sure the update succeeded (really this worked out pretty well, but still not too maintainable)
* Many of the tests tried to test full processes, which took minutes to run
* We didn't have very good eventing systems, so many of the steps would wait for message queue processes to finish by polling a mongo database before it went to the next step, also making tests slower
* After that main QA moved to a different position (to our product manager), spec flow steps started getting mroe confusing and often duplicated.  This also happened around the time that an update to the VS spec flow plugin came out, which performed horribly on our test solution

Many of those could likely be improved by having more isolated environments (such as a dedicated local database that gets truncated after each test).  And some better development principles to make sure both the gherkin rules and spec flow steps were maintainable and discoverable.

Outside of my team, this same framework was being used for UI testing (which allowed me to compare API and web output above).  The API tests were reliable, and fairly fast, being all newer code and very machine readable JSON outputs.  The web tests used Selenium driver, with a custom built wrapper ontop of it, on a very much aging ASP.NET website.  They were incredibly slow and very unreliable, often timing out, and when run in parallel brought any computer we had to its knees.

Those other teams using it for UI tests did not have nearly as technical individuals though the upper ranks.  So even worse than QA and devs writing the tests, most teams maybe a QA would specify some rules, but more often the developers would have to do all the work to build out the tests, in the inexact language that is gherkin (at least for us, other more well defined domains might have better luck here).

## Selenium Wrapper Version 3 (back to C#)

Selenium version 1 was pure selenium (gone before I joined the company).  Version 2 was the SpecFlow wrapper (what I just described above) around WebDriver.

Version 3 moved away from SpecFlow because every person writing the tests could both write and read C# far better than reading gherkin that was written without guidelines by dozens of people, therefore not following a similar voice or using consistent terms.  And was still using WebDriver.

This was a case where people had been thinking about how to approach it for too long of time, and ended up trying a very overengineered solution, with people working on it who were not quite tallented enough at the time to successfully implement that overengineered solution.

I'm uncertain what goals it had at the start.  But it ended up that we wanted ALL the old SpecFlow tests ported over to this new framework before we really unleashed it.  Early results that were shared implied both speed and reliability were greatly improved.  But only decreased as more of the tests were ported.

Even worse, the usability of this framework was quite bad, it had little if any documentation, or guidance again.  Errors were often directly spat out from WebDriver, meaning if you happened to google it you'd get results talking about things deep down in this custom framework, which therefore were not very helpful.  You'd need to search through similar tests to just follow patterns that appear to work there.

This resulted in even more unreliability.  And the solution with this design had a global retry mechanism, and modifying it would be quite a bit of refactoring.  So every unreliable element ended up waiting at least 10 seconds, even if it would reliably work within 1 second but wouldn't work with 0 wait, it had a minimum of 10 seconds.

## Selenium Wrapper Version 4 (xUnit/xBehave)

This verison we decided to make as thin of wrapper as possible.  Using extension methods for any non-universal tools, and making sure almost all the classes implmented interfaces from `WebDriver` to allow for the possibility of by-passing the built in authorization and other niceities if needed for a more general purpose test procedure.

Again we tried to port **most** of the tests before relying on this version.  But with the ability of using the extension methods for the retry additions caused reliability to be tuned per individual step, each element lookup, which did improve speed and reliability.

## Selnium Wrapper Version 4B (NUnit)

We came to dislike many of the features of XBehave, and therefore often wrote the tests only in XUnit, but all our unit tests used NUnit.  So it was pointless and foolish to have that discrepency, so converted it back to using NUnit.

This solution, along with improving the test environment machines, resulted in quite reliable tests being possible.  

But many tests were still not reliable (the processes involved were part of it), so some powers at be decided to enforce what they referred to "SLAs", and would just go disable tests that had poor success rates, obviously lowing test coverage.  But then most of the tests were still quite redundant (which helped cause the speed and overloading issues) but this made the developers not despise going through the CD pipeline, as other parts of the pipeline became significantly worse and caused that despise to be directed elsewhere.

## Summary

Without good design principles, and with fixing problems that don't exist (Version 3 being no faster or more reliable than version 2), and often rebuilding from scratch instead of having an transition layer for situations where the old version worked alright.