import numpy as np
import matplotlib.pyplot as plt

def generatePoints(num, mu=0, sigma2=1):
	return np.sqrt(sigma2) * np.random.randn(num,2) + mu

def generateCosts(d1,d2, m): 
	for i, p1 in enumerate(d1): 
		for j, p2 in enumerate(d2): 
			m[i,j] = np.linalg.norm(p1-p2)**2
	return m

# init
# m, n = 5,6
# iters = 1
# a = 0.05
# scale = 1.0 /(float(m)*float(n))
# costs = np.zeros((n,m))

# # start and end distribution
# start = generatePoints(n, mu=5)
# end = generatePoints(m)
# res = start
# costs =  generateCosts(start,end,costs)
# plt.plot(start.transpose()[0], start.transpose()[1],'ro')
# plt.plot(end.transpose()[0], end.transpose()[1], 'bo')


# costs = scale * generateCosts(res,end,costs)
# # t = scale * np.exp(-costs * a)
# t = np.exp(-costs*a)
# res = t.dot(end)
# print(t, res)
# plt.plot(res.transpose()[0], res.transpose()[1], 'go',alpha=1)


# # for i in range(iters): 
# # 	alpha = float(i+1)/iters
# # 	costs =  generateCosts(res,end,costs)
# # 	t = scale * np.exp(costs * (i+1))
# # 	res = t.dot(end)
# # 	plt.plot(res.transpose()[0], res.transpose()[1], 'go',alpha=alpha)
# # 	# start = res


# plt.show()



##### find min cost point to point mapping ####

m, n = 3, 3
iters = 1
a = 0.05
scale = 1.0 /(float(m)*float(n))
costs = np.zeros((n,m))


start = generatePoints(n, mu=5)
end = generatePoints(m)
res = start
costs =  generateCosts(start,end,costs)
print(np.argmin(np.array(costs), axis=1), np.array(costs))
plt.plot(start.transpose()[0], start.transpose()[1],'ro')
plt.plot(end.transpose()[0], end.transpose()[1], 'bo')

plt.show()





