import numpy as np
from sklearn.ensemble import IsolationForest

def detect_anomaly(amounts):
    if len(amounts) < 5:
        return False

    model = IsolationForest(contamination=0.15)
    model.fit(np.array(amounts).reshape(-1,1))

    last_value = np.array(amounts[-1]).reshape(-1,1)
    pred = model.predict(last_value)

    return pred[0] == -1
