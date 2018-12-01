import numpy as np

def generate_points(num_points):
    return 500 * np.random.random_sample((num_points, 2))

def generate_costs(d1, d2):
    costs = np.zeros((d1.shape[0], d2.shape[0]))
    for i, point1 in enumerate(d1):
        for j, point2 in enumerate(d2):
            costs[i, j] = np.linalg.norm(point2 - point1) # square this if it isn't already
    return costs

m, n = 19, 20
alpha = 0.05
start = generate_points(m)
dest = generate_points(n)
costs = generate_costs(start, dest)
t = np.exp(-costs*alpha)
# take rows of t and rescale to sum to 1/numrows
# take cols of t and rescale to sum to 1/numcols
# iterate
print(t)


