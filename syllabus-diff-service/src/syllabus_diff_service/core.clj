(ns syllabus-diff-service.core
  (:require [ring.adapter.jetty :refer [run-jetty]]
            [syllabus-diff-service.api :refer [app]])
  (:gen-class))

(defn -main
  "Uruchamia serwer HTTP"
  [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3001"))]
    (println "========================================")
    (println "Syllabus Diff Service starting...")
    (println "========================================")
    (println (str "Server running on http://localhost:" port))
    (println "Endpoints:")
    (println "   GET  /health")
    (println "   POST /api/diff/compare")
    (println "   POST /api/diff/changelog")
    (println "   POST /api/diff/similarity")
    (println "========================================")
    (run-jetty app {:port port :join? false})))