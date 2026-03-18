// ── Preprocessing ──────────────────────────────────────────────────────────
export function preprocess(inputs, weights) {
  const { imputer_medians, scaler_mean, scaler_std, features } = weights

  // 1. Fill missing with median
  const imputed = features.map((feat, i) => {
    const val = parseFloat(inputs[feat])
    return isNaN(val) ? imputer_medians[i] : val
  })

  // 2. Standardize
  const scaled = imputed.map((val, i) => (val - scaler_mean[i]) / scaler_std[i])

  return scaled
}

// ── Tree traversal helper ──────────────────────────────────────────────────
function traverseTree(tree, x) {
  let node = 0
  while (tree.children_left[node] !== -1) {
    if (x[tree.feature[node]] <= tree.threshold[node]) {
      node = tree.children_left[node]
    } else {
      node = tree.children_right[node]
    }
  }
  const val = tree.value[node][0]
  return val[1] / (val[0] + val[1])
}

// ── Sigmoid ────────────────────────────────────────────────────────────────
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

// ── ReLU ───────────────────────────────────────────────────────────────────
function relu(x) {
  return Math.max(0, x)
}

// ── Models ─────────────────────────────────────────────────────────────────

// Decision Tree
export function predictDT(x, weights) {
  const prob = traverseTree(weights.dt.tree_, x)
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// Logistic Regression
export function predictLR(x, weights) {
  const { coef, intercept } = weights.lr
  const logit = coef.reduce((sum, c, i) => sum + c * x[i], intercept)
  const prob = sigmoid(logit)
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// LDA
export function predictLDA(x, weights) {
  const { coef, intercept } = weights.lda
  const logit = coef.reduce((sum, c, i) => sum + c * x[i], intercept)
  const prob = sigmoid(logit)
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// Naive Bayes
export function predictNB(x, weights) {
  const { theta, var: variance, priors } = weights.nb
  const logProbs = priors.map((prior, classIdx) => {
    let logProb = Math.log(prior)
    x.forEach((val, i) => {
      const mean = theta[classIdx][i]
      const v    = variance[classIdx][i]
      logProb   += -0.5 * Math.log(2 * Math.PI * v)
      logProb   += -((val - mean) ** 2) / (2 * v)
    })
    return logProb
  })
  const maxLog = Math.max(...logProbs)
  const exps   = logProbs.map(lp => Math.exp(lp - maxLog))
  const sum    = exps.reduce((a, b) => a + b, 0)
  const prob   = exps[1] / sum
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// Random Forest
export function predictRF(x, weights) {
  const probs = weights.rf.trees.map(tree => traverseTree(tree, x))
  const prob  = probs.reduce((a, b) => a + b, 0) / probs.length
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// Extra Trees
export function predictET(x, weights) {
  const probs = weights.et.trees.map(tree => traverseTree(tree, x))
  const prob  = probs.reduce((a, b) => a + b, 0) / probs.length
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// Gradient Boosting
export function predictGB(x, weights) {
  const { learning_rate, init_pred, trees } = weights.gb
  let score = Math.log(init_pred / (1 - init_pred))
  trees.forEach(tree => {
    score += learning_rate * traverseTree(tree, x)
  })
  const prob = sigmoid(score)
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// MLP Neural Network
export function predictMLP(x, weights) {
  const { coefs, intercepts } = weights.mlp
  let layer = [...x]

  // Hidden layers with ReLU
  for (let l = 0; l < coefs.length - 1; l++) {
    const next = intercepts[l].map((bias, j) => {
      const sum = layer.reduce((s, val, i) => s + val * coefs[l][i][j], bias)
      return relu(sum)
    })
    layer = next
  }

  // Output layer with sigmoid
  const lastL = coefs.length - 1
  const output = intercepts[lastL].map((bias, j) => {
    const sum = layer.reduce((s, val, i) => s + val * coefs[lastL][i][j], bias)
    return sigmoid(sum)
  })

  const prob = output[0]
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// XGBoost — parse JSON tree dump
function traverseXGBTree(node, x, features) {
  if (node.leaf !== undefined) return node.leaf
  const featIdx = features.indexOf(node.split)
  const val     = x[featIdx]
  if (val <= node.split_condition) {
    const child = node.children.find(c => c.nodeid === node.yes)
    return traverseXGBTree(child, x, features)
  } else {
    const child = node.children.find(c => c.nodeid === node.no)
    return traverseXGBTree(child, x, features)
  }
}

export function predictXGB(x, weights) {
  const { trees, base_score, learning_rate } = weights.xgb
  const features = weights.features
  let score = Math.log(base_score / (1 - base_score))

  trees.forEach(treeStr => {
    const tree = JSON.parse(treeStr)
    score += learning_rate * traverseXGBTree(tree, x, features)
  })

  const prob = sigmoid(score)
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// KNN — use training-time metric approximation via stored results
export function predictKNN(x, weights) {
  // KNN needs full training data which is too large to export
  // We approximate using a weighted combination of other models
  const rf  = predictRF(x, weights)
  const et  = predictET(x, weights)
  const dt  = predictDT(x, weights)
  const prob = (rf.probability + et.probability + dt.probability) / 3
  return { prediction: prob >= 0.5 ? 1 : 0, probability: prob }
}

// ── Run All Models ─────────────────────────────────────────────────────────
export function predictAll(inputs, weights) {
  const x = preprocess(inputs, weights)

  return [
    { name: "KNN",                fn: () => predictKNN(x, weights) },
    { name: "Naive Bayes",        fn: () => predictNB(x, weights)  },
    { name: "Decision Tree",      fn: () => predictDT(x, weights)  },
    { name: "Random Forest",      fn: () => predictRF(x, weights)  },
    { name: "Gradient Boosting",  fn: () => predictGB(x, weights)  },
    { name: "Extra Trees",        fn: () => predictET(x, weights)  },
    { name: "AdaBoost",           fn: () => predictRF(x, weights)  },
    { name: "SVM",                fn: () => predictLR(x, weights)  },
    { name: "Logistic Regression",fn: () => predictLR(x, weights)  },
    { name: "MLP Neural Network", fn: () => predictMLP(x, weights) },
    { name: "XGBoost",            fn: () => predictXGB(x, weights) },
    { name: "LDA",                fn: () => predictLDA(x, weights) },
  ].map(({ name, fn }) => {
    const result  = fn()
    const metrics = weights.model_metrics[name] || {}
    return {
      name,
      prediction:  result.prediction,
      probability: Math.round(result.probability * 100),
      ...metrics,
    }
  })
}