import numpy as np
import matplotlib.pyplot as plt

def generatePoints(num, mu=0, sigma2=1):
	return np.sqrt(sigma2) * np.random.randn(num,2) + mu

def generateCosts(d1,d2, m): 
	for i, p1 in enumerate(d1): 
		for j, p2 in enumerate(d2): 
			m[i,j] = np.linalg.norm(p1-p2)**2
	return m

def sinkhorn(t, scale_row=True, err=1.0, i=0, timeout=100, stopThres=1e-9):
	while (abs(err) > stopThres and i < timeout):
		i+=1
		if scale_row:
			sums = np.sum(t, axis=1)
			err = np.sum(sums) - m
			scalar = 1.0/sums
			t = (t.transpose() * scalar).transpose()
			print(t)
			print("new sum {} by rows".format(np.sum(t, axis=1)))
			scale_row = not scale_row
		else:
			sums = np.sum(t, axis=0)
			err = np.sum(sums) - n
			scalar = 1.0/sums
			t =  t * scalar.transpose()
			scale_row =  not scale_row
			print(t)
			print("new sum {} by cols".format(np.sum(t, axis=0)))
		print("matrix: {}, error {}".format(t, err))
	return t

# init
m, n = 5,3
iters = 3
a = 0.05
scale = 1.0 /(float(m)*float(n))
costs = np.zeros((n,m))

# start and end distribution
start = generatePoints(n, mu=5)
end = generatePoints(m)
res = start
costs =  generateCosts(start,end,costs)
plt.plot(start.transpose()[0], start.transpose()[1],'ro')
plt.plot(end.transpose()[0], end.transpose()[1], 'bo')
costs =  generateCosts(res,end,costs)
t = np.exp(-costs * a)
G = sinkhorn(t)

# color 
xs = start
xt = end
thr =1e-8
mx = G.max()

# Plotting mapping
print("G {}".format(G))
for i in range(xs.shape[0]):
    for j in range(xt.shape[0]):
        if G[i, j] / mx > thr:
			print("{} {}".format([xs[i, 0], xt[j, 0]], [xs[i, 1], xt[j, 1]] ))
			print("alpha {}, G ij {} ".format(G[i, j] / mx, G[i,j]))
			# plt.plot([xs[i, 0], xt[j, 0]], [xs[i, 1], xt[j, 1]], alpha=G[i, j] / mx)
			plt.plot([xs[i, 0], xt[j, 0]], [xs[i, 1], xt[j, 1]], alpha=G[i, j])

plt.show()