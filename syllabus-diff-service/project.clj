(defproject syllabus-diff-service "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "https://example.com/FIXME"
  :license {:name "EPL-2.0 OR GPL-2.0-or-later WITH Classpath-exception-2.0"
            :url "https://www.eclipse.org/legal/epl-2.0/"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [ring/ring-core "1.10.0"]
                 [ring/ring-jetty-adapter "1.10.0"]
                 [ring/ring-json "0.5.1"]
                 [ring/ring-defaults "0.3.4"]
                 [compojure "1.7.0"]
                 [cheshire "5.11.0"]
                 [org.clojure/data.json "2.4.0"]
                 [clj-http "3.12.3"]
                 [ring-cors "0.1.13"]]
  :main ^:skip-aot syllabus-diff-service.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}})
