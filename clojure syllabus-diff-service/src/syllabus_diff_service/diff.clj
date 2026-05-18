(ns syllabus-diff-service.diff
  (:require [clojure.data :refer [diff]]  ;; ✅ Wbudowane w Clojure!
            [clojure.string :as str]))

;; ============================================
;; Funkcje pomocnicze
;; ============================================

(defn safe-get [m k default]
  "Bezpieczne pobranie wartości z mapy z domyślną wartością"
  (or (get m k) default))

(defn normalize-version
  "Normalizuje strukturę wersji do porównania (usuwa pola techniczne)"
  [version]
  (select-keys version [:title :description :learningOutcomes 
                        :prerequisites :literature :assessmentMethods
                        :totalHours :theoryHours :labHours :otherHours]))

(defn field-label
  "Zwraca czytelną nazwę pola"
  [field]
  (case field
    :title "Tytuł"
    :description "Opis"
    :learningOutcomes "Efekty kształcenia"
    :prerequisites "Wymagania wstępne"
    :literature "Literatura"
    :assessmentMethods "Metody oceniania"
    :totalHours "Godziny całkowite"
    :theoryHours "Godziny wykładu"
    :labHours "Godziny laboratorium"
    :otherHours "Godziny inne"
    (name field)))

;; ============================================
;; Obliczanie różnic
;; ============================================

(defn calculate-diff
  "Oblicza różnice między dwiema wersjami"
  [version1 version2]
  (let [v1 (normalize-version version1)
        v2 (normalize-version version2)
        [only-v1 only-v2 common] (diff v1 v2)]
    {:removed (or only-v1 {})
     :added (or only-v2 {})
     :unchanged (or common {})
     :changed (filter (fn [[k v]]
                       (and (contains? v1 k)
                            (contains? v2 k)
                            (not= (get v1 k) (get v2 k))))
                     v2)}))

(defn calculate-similarity
  "Oblicza procentową podobieństwo między wersjami (0-100)"
  [version1 version2]
  (let [v1 (normalize-version version1)
        v2 (normalize-version version2)
        all-keys (set (concat (keys v1) (keys v2)))
        matching (count (filter #(= (get v1 %) (get v2 %)) all-keys))
        total (count all-keys)]
    (if (zero? total)
      100
      (int (* (/ matching total) 100)))))

(defn categorize-change
  "Kategoryzuje zmianę jako 'major', 'minor' lub 'cosmetic'"
  [field old-value new-value]
  (let [major-fields #{:learningOutcomes :totalHours :theoryHours :labHours}
        minor-fields #{:prerequisites :assessmentMethods :literature}
        cosmetic-fields #{:title :description :otherHours}]
    (cond
      (contains? major-fields field) :major
      (contains? minor-fields field) :minor
      (contains? cosmetic-fields field) :cosmetic
      :else :minor)))

(defn detailed-diff
  "Tworzy szczegółowy raport różnic z kategoryzacją"
  [version1 version2]
  (let [v1 (normalize-version version1)
        v2 (normalize-version version2)
        all-keys (set (concat (keys v1) (keys v2)))]
    (reduce
      (fn [acc field]
        (let [val1 (get v1 field)
              val2 (get v2 field)]
          (cond
            (and (nil? val1) (some? val2))
            (update acc :added conj {:field field
                                      :label (field-label field)
                                      :value val2
                                      :category (categorize-change field nil val2)})

            (and (some? val1) (nil? val2))
            (update acc :removed conj {:field field
                                        :label (field-label field)
                                        :value val1
                                        :category (categorize-change field val1 nil)})

            (not= val1 val2)
            (update acc :changed conj {:field field
                                        :label (field-label field)
                                        :oldValue val1
                                        :newValue val2
                                        :category (categorize-change field val1 val2)})

            :else acc)))
      {:added [] :removed [] :changed []}
      all-keys)))

(defn generate-summary
  "Generuje podsumowanie zmian w czytelnej formie"
  [diff-result]
  (let [added-count (count (:added diff-result))
        removed-count (count (:removed diff-result))
        changed-count (count (:changed diff-result))
        major-changes (count (filter #(= :major (:category %)) (:changed diff-result)))
        minor-changes (count (filter #(= :minor (:category %)) (:changed diff-result)))]
    {:totalChanges (+ added-count removed-count changed-count)
     :added added-count
     :removed removed-count
     :changed changed-count
     :majorChanges major-changes
     :minorChanges minor-changes
     :hasSignificantChanges (or (> major-changes 0) (> removed-count 0))}))

;; ============================================
;; Changelog - historia zmian
;; ============================================

(defn generate-changelog-entry
  "Generuje pojedynczy wpis changelog"
  [version-number changes metadata]
  {:version version-number
   :date (:createdAt metadata)
   :author (:createdBy metadata)
   :changeNote (:changeNote metadata)
   :summary (generate-summary changes)
   :changes changes})

(defn compare-versions
  "Główna funkcja porównująca dwie wersje i zwracająca kompletny raport"
  [version1 version2]
  (let [diff-result (detailed-diff version1 version2)
        summary (generate-summary diff-result)
        similarity (calculate-similarity version1 version2)]
    {:comparison {:version1 (safe-get version1 :versionNumber 0)
                  :version2 (safe-get version2 :versionNumber 0)
                  :similarity similarity}
     :summary summary
     :details diff-result}))