import numpy as np
import matplotlib.pyplot as plt

def generate_points(num_points):
    return 500 * np.random.random_sample((num_points, 2))

def generate_costs(d1, d2):
    costs = np.zeros((d1.shape[0], d2.shape[0]))
    for i, point1 in enumerate(d1):
        for j, point2 in enumerate(d2):
            costs[i, j] = np.linalg.norm(point2 - point1)**2 # square this if it isn't already
    return costs

def rescale_rows(map):
    print(np.sum(map, axis=1, keepdims=True))
    print(np.sum(map, axis=0, keepdims=True))
    return map / np.sum(map, axis=1, keepdims=True)

def rescale_cols(map):
    return map / np.sum(map, axis=0)

m, n = 3, 3 
alpha = 0.000005
num_it = 2
start = generate_points(m)
dest = generate_points(n)
costs = generate_costs(start, dest)
t = np.exp(-costs*alpha)
for i in range(num_it):
    t = rescale_rows(t)
    print(t)
    t = rescale_cols(t)
    print(t)
print(t)


# take rows of t and rescale to sum to 1/numrows
# take cols of t and rescale to sum to 1/numcols
# iterate


