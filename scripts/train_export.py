import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier, ExtraTreesClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from xgboost import XGBClassifier
import json

# ── Load & Preprocess ──────────────────────────────────────────────────────
df = pd.read_csv("waterQuality.csv")

X = df.drop("Potability", axis=1)
y = df["Potability"]

FEATURES = list(X.columns)

imputer = SimpleImputer(strategy="median")
X_imputed = imputer.fit_transform(X)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# ── Train All Models ───────────────────────────────────────────────────────
models = {
    "KNN":                 KNeighborsClassifier(n_neighbors=5),
    "Naive Bayes":         GaussianNB(),
    "Decision Tree":       DecisionTreeClassifier(max_depth=10, random_state=42),
    "Random Forest":       RandomForestClassifier(n_estimators=100, random_state=42),
    "Gradient Boosting":   GradientBoostingClassifier(n_estimators=100, random_state=42),
    "Extra Trees":         ExtraTreesClassifier(n_estimators=100, random_state=42),
    "AdaBoost":            AdaBoostClassifier(n_estimators=100, random_state=42),
    "SVM":                 SVC(probability=True, random_state=42),
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "MLP Neural Network":  MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=1000, random_state=42),
    "XGBoost":             XGBClassifier(n_estimators=100, random_state=42, eval_metric="logloss", verbosity=0),
    "LDA":                 LinearDiscriminantAnalysis(),
}

results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    cm = confusion_matrix(y_test, y_pred)
    results[name] = {
        "accuracy":  round(accuracy_score(y_test, y_pred) * 100, 2),
        "precision": round(precision_score(y_test, y_pred, zero_division=0) * 100, 2),
        "recall":    round(recall_score(y_test, y_pred, zero_division=0) * 100, 2),
        "f1":        round(f1_score(y_test, y_pred, zero_division=0) * 100, 2),
        "confusion_matrix": {
            "tn": int(cm[0][0]),
            "fp": int(cm[0][1]),
            "fn": int(cm[1][0]),
            "tp": int(cm[1][1]),
        }
    }
    print(f"✓ {name}: Acc={results[name]['accuracy']}%  F1={results[name]['f1']}%")
    print(f"        TN={cm[0][0]}  FP={cm[0][1]}  FN={cm[1][0]}  TP={cm[1][1]}")

# ── Refit models cleanly for export ───────────────────────────────────────
dt  = DecisionTreeClassifier(max_depth=10, random_state=42).fit(X_train, y_train)
lr  = LogisticRegression(max_iter=1000, random_state=42).fit(X_train, y_train)
nb  = GaussianNB().fit(X_train, y_train)
rf  = RandomForestClassifier(n_estimators=100, random_state=42).fit(X_train, y_train)
gb  = GradientBoostingClassifier(n_estimators=100, random_state=42).fit(X_train, y_train)
et  = ExtraTreesClassifier(n_estimators=100, random_state=42).fit(X_train, y_train)
mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=1000, random_state=42).fit(X_train, y_train)
xgb = XGBClassifier(n_estimators=100, random_state=42, eval_metric="logloss", verbosity=0).fit(X_train, y_train)
lda = LinearDiscriminantAnalysis().fit(X_train, y_train)

# ── Helper: export sklearn tree structure ──────────────────────────────────
def export_tree(t):
    return {
        "feature":        t.tree_.feature.tolist(),
        "threshold":      t.tree_.threshold.tolist(),
        "children_left":  t.tree_.children_left.tolist(),
        "children_right": t.tree_.children_right.tolist(),
        "value":          t.tree_.value.tolist(),
    }

# ── Build output JSON ──────────────────────────────────────────────────────
output = {
    "features":        FEATURES,
    "imputer_medians": imputer.statistics_.tolist(),
    "scaler_mean":     scaler.mean_.tolist(),
    "scaler_std":      scaler.scale_.tolist(),
    "model_metrics":   results,
    "feature_ranges": {
        feat: {
            "min":  round(float(df[feat].min()), 2),
            "max":  round(float(df[feat].max()), 2),
            "mean": round(float(df[feat].mean()), 2),
        }
        for feat in FEATURES
    },

    # Decision Tree
    "dt": {
        "tree_": export_tree(dt)
    },

    # Logistic Regression
    "lr": {
        "coef":      lr.coef_[0].tolist(),
        "intercept": float(lr.intercept_[0]),
    },

    # Naive Bayes
    "nb": {
        "theta":  nb.theta_.tolist(),
        "var":    nb.var_.tolist(),
        "priors": nb.class_prior_.tolist(),
    },

    # Random Forest
    "rf": {
        "trees": [export_tree(t) for t in rf.estimators_]
    },

    # Gradient Boosting
    "gb": {
        "learning_rate": gb.learning_rate,
        "init_pred":     float(gb.init_.class_prior_[1]),
        "trees":         [export_tree(t[0]) for t in gb.estimators_]
    },

    # Extra Trees
    "et": {
        "trees": [export_tree(t) for t in et.estimators_]
    },

    # MLP Neural Network
    "mlp": {
        "coefs":      [c.tolist() for c in mlp.coefs_],
        "intercepts": [i.tolist() for i in mlp.intercepts_],
        "activation": "relu",
    },

    # XGBoost — export as leaf weights via get_dump
    "xgb": {
        "trees":        xgb.get_booster().get_dump(dump_format="json"),
        "base_score":   0.5,
        "learning_rate": 0.3,
    },

    # LDA
    "lda": {
        "coef":      lda.coef_[0].tolist(),
        "intercept": float(lda.intercept_[0]),
    },
}
# Export real samples from dataset
potable_samples = df[df['Potability'] == 1].dropna().head(20)
not_potable_samples = df[df['Potability'] == 0].dropna().head(20)

output['safe_samples'] = potable_samples.drop('Potability', axis=1).round(2).values.tolist()
output['unsafe_samples'] = not_potable_samples.drop('Potability', axis=1).round(2).values.tolist()
with open("src/data/model_weights.json", "w") as f:
    json.dump(output, f)

print("\n✅ model_weights.json saved to src/data/")
print(f"   Features:        {FEATURES}")
print(f"   Models exported: {list(results.keys())}")
