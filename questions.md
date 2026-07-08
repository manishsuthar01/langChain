# LegalGPT RAG Test Questions

## Basic Retrieval

-   What is the notice period for resignation?
-   Can an employee be terminated without notice?
-   What is the company's refund policy?
-   How long does the client have to pay an invoice?
-   What interest is charged on late payments?
-   What are the confidentiality obligations of an employee?
-   Who owns the intellectual property created by the contractor?
-   What law governs this agreement?

## Semantic Search

-   Can my employer fire me immediately for serious misconduct?
-   What happens if I leak confidential company information?
-   If I quit my job, how much notice should I give?
-   What are the consequences of missing the notice period?
-   Can I share company secrets with my friend?
-   Who is responsible for taxes if I'm working as a freelancer?
-   Who owns the software I develop under this agreement?

## Multi-Clause Questions

-   Can an employee who leaks confidential information be terminated
    immediately?
-   What happens if a contractor creates software and then resigns?
-   Can the company deduct salary if I don't complete my notice period?
-   If payment is delayed, what penalties apply and how soon must
    invoices be paid?

## Reasoning Questions

-   Can an employee disclose confidential information after leaving the
    company?
-   A freelancer built an application for the company. Who owns the
    source code?
-   Can the company immediately dismiss an employee who steals
    confidential customer data?
-   If a flood delays delivery, who is responsible?
-   How should disputes under this agreement be resolved?

## Questions That Should Return 'Not Found'

-   What is the employee's annual bonus?
-   How many paid vacation days does the employee receive?
-   What maternity leave benefits are provided?
-   What is the company's work-from-home policy?
-   Does this agreement include overtime pay?
-   Can employees purchase company shares?
-   What is the probation period?

## Stress-Test Questions

-   Can I get fired instantly?
-   What if I expose company secrets?
-   When must I settle my invoice?
-   Who keeps ownership of the software I wrote?
-   Can my employer sue me for leaking data?
-   What happens if I don't pay on time?
-   Who decides legal disputes?
-   Am I allowed to tell outsiders about internal documents?
-   Do I have to return company property after being fired?
-   Can the agreement end because of fraud or theft?

## Evaluation Checklist

-   Correct chunk(s) are retrieved.
-   Relevant sections appear in the top 3 results.
-   The LLM answers only from retrieved context.
-   If information is unavailable, the system explicitly says it is not
    found.
