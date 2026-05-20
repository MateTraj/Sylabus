Projekt aplikacji internetowej "Zarządzanie sylabusami" na studia
UWAGA!
Projekt do uruchomienia wymaga:
- .NET SDK V8.0 +
- Node.js V18.0+
- Java V17+
- Leiningen

URUCHAMIANIE BEZ IDE:
1. Pobranie projektu / git clone https://github.com/MateTraj/Sylabus.git
2. Wejść do folderu ReactApp1/ReactApp1.Server
3. uruchomić Backend: dotnet run
GDYBY NIE URUCHOMIŁ SIĘ FRONTEND SAMODZIELNIE
3.1. Wejść do folderu ReactApp1/reactapp1.client
3.2. npm run dev
4. Wejść do folderu ReactApp1/syllabus-diff-service
5. Uruchomić mikroserwis Clojure: lein run