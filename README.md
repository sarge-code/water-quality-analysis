# 💧 Water Quality Analysis

A machine learning web application that predicts water potability using 12 classification models with real-time inference, confusion matrices, and Gemini AI expert analysis.

🔗 **Live Demo (Vercel):** https://water-quality-analysis-clone.vercel.app/
🔗 **Live Demo (GitHub Pages):** https://sarge-code.github.io/water-quality-analysis/

---

## 📌 Overview

This project analyzes water quality parameters to determine whether a water sample is **safe** or **not safe** to drink. It was built as a college project to demonstrate the application of multiple machine learning algorithms on a real-world dataset.

---

## 🧪 Dataset

- **Source:** [Water Potability Dataset](https://www.kaggle.com/datasets/adityakadiwal/water-potability)
- **Samples:** 3,276 water samples
- **Features:** 9 physicochemical parameters
- **Target:** Potability (1 = Safe, 0 = Not Safe)
- **Class Balance:** 61% Not Safe / 39% Safe

### Features
| Parameter | Unit | Description |
|---|---|---|
| pH | 0–14 | Acidity/alkalinity of water |
| Hardness | mg/L | Calcium and magnesium content |
| Solids | ppm | Total dissolved solids |
| Chloramines | ppm | Disinfectant levels |
| Sulfate | mg/L | Dissolved sulfate amount |
| Conductivity | μS/cm | Electrical conductivity |
| Organic Carbon | ppm | Total organic carbon |
| Trihalomethanes | μg/L | Byproducts of chlorination |
| Turbidity | NTU | Clarity of water |

---

## 🤖 Models

| Model | Accuracy |
|---|---|
| SVM | 67.07% |
| Extra Trees | 66.46% |
| Random Forest | 65.85% |
| Gradient Boosting | 65.24% |
| Decision Tree | 64.18% |
| KNN | 61.89% |
| AdaBoost | 61.89% |
| MLP Neural Network | 61.43% |
| Naive Bayes | 61.43% |
| Logistic Regression | 60.98% |
| XGBoost | 68.29% |
| LDA | 61.28% |

---

## ✨ Features

- **12 ML Models** running client-side in the browser
- **Real-time predictions** with potability probability
- **Confusion Matrix** for every model
- **Model Accuracy Comparison** chart
- **Gemini AI Expert Analysis** for each water sample
- **Load Sample** buttons with real dataset values
- **Responsive design** — works on mobile and desktop

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- Recharts (visualization)
- Google Generative AI SDK

**Machine Learning**
- Python + scikit-learn
- XGBoost
- Models exported as JSON for client-side inference

**Deployment**
- Vercel
- GitHub Pages

## 👨‍💻 Author

**Shashank**
- College Project — Business Intelligence & Analytics
- Dataset originally analyzed in R, rebuilt as a full-stack web application
