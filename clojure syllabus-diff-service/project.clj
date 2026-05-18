(defproject syllabus-diff-service "0.1.0-SNAPSHOT"
  :description "Microservice for comparing syllabus versions"
  :url "http://localhost:3001"
  :license {:name "EPL-2.0"
            :url "https://www.eclipse.org/legal/epl-2.0/"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 ;; Ring - HTTP server
                 [ring/ring-core "1.10.0"]
                 [ring/ring-jetty-adapter "1.10.0"]
                 [ring/ring-json "0.5.1"]
                 [ring/ring-defaults "0.3.4"]
                 ;; Routing
                 [compojure "1.7.0"]
                 ;; JSON
                 [cheshire "5.11.0"]
                 [org.clojure/data.json "2.4.0"]
                 ;; ✅ POPRAWKA: zmiana org.clojure/data na org.clojure/data.diff
                 [org.clojure/data.diff "1.0.0"]
                 ;; HTTP client
                 [clj-http "3.12.3"]
                 ;; CORS
                 [ring-cors "0.1.13"]]
  :main ^:skip-aot syllabus-diff-service.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}
             :dev {:dependencies [[ring/ring-mock "0.4.0"]]}})