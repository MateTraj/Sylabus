(ns syllabus-diff-service.api
  (:require [compojure.core :refer [defroutes GET POST]]
            [compojure.route :as route]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [ring.middleware.defaults :refer [wrap-defaults api-defaults]]
            [ring.middleware.cors :refer [wrap-cors]]
            [syllabus-diff-service.diff :as diff]))

;; ============================================
;; Handlery endpointów
;; ============================================

(defn compare-versions-handler
  "Porównuje dwie wersje sylabusa"
  [request]
  (let [body (:body request)
        version1 (:version1 body)
        version2 (:version2 body)]
    (if (and version1 version2)
      {:status 200
       :body (diff/compare-versions version1 version2)}
      {:status 400
       :body {:error "Wymagane s¹ dwie wersje: version1 i version2"}})))

(defn generate-changelog-handler
  "Generuje changelog dla wszystkich wersji przedmiotu"
  [request]
  (let [body (:body request)
        versions (:versions body)]
    (if (and versions (> (count versions) 0))
      (let [sorted-versions (sort-by :versionNumber versions)
            changelog (map-indexed
                        (fn [idx version]
                          (if (zero? idx)
                            {:version (:versionNumber version)
                             :date (:createdAt version)
                             :author (:createdBy version)
                             :changeNote "Pierwsza wersja"
                             :type :initial}
                            (let [prev-version (nth sorted-versions (dec idx))
                                  changes (diff/detailed-diff prev-version version)
                                  summary (diff/generate-summary changes)]
                              {:version (:versionNumber version)
                               :date (:createdAt version)
                               :author (:createdBy version)
                               :changeNote (:changeNote version)
                               :summary summary
                               :changes changes
                               :type :update})))
                        sorted-versions)]
        {:status 200
         :body {:changelog (reverse changelog)
                :totalVersions (count versions)}})
      {:status 400
       :body {:error "Wymagana jest lista wersji"}})))

(defn similarity-handler
  "Oblicza podobieñstwo miêdzy wersjami"
  [request]
  (let [body (:body request)
        version1 (:version1 body)
        version2 (:version2 body)]
    (if (and version1 version2)
      {:status 200
       :body {:similarity (diff/calculate-similarity version1 version2)
              :version1 (:versionNumber version1)
              :version2 (:versionNumber version2)}}
      {:status 400
       :body {:error "Wymagane s¹ dwie wersje"}})))

(defn health-check-handler
  "Health check endpoint"
  [_]
  {:status 200
   :body {:status "ok"
          :service "syllabus-diff-service"
          :version "1.0.0"
          :timestamp (System/currentTimeMillis)}})

;; ============================================
;; Routing
;; ============================================

(defroutes app-routes
  (GET "/health" [] health-check-handler)

  (POST "/api/diff/compare" [] compare-versions-handler)

  (POST "/api/diff/changelog" [] generate-changelog-handler)

  (POST "/api/diff/similarity" [] similarity-handler)

  (route/not-found {:status 404
                    :body {:error "Endpoint not found"}}))

;; ============================================
;; Middleware
;; ============================================

(def app
  (-> app-routes
      (wrap-json-body {:keywords? true})
      wrap-json-response
      (wrap-cors :access-control-allow-origin [#"http://localhost:5173" 
                                                #"https://localhost:5173"]
                 :access-control-allow-methods [:get :post :put :delete])
      (wrap-defaults api-defaults)))