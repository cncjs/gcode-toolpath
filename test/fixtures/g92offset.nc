(Test for G92 temporary offsets)
(The motions should be performed in absolute coordinates)

(Start with no offsets - rel=abs)

(Go from 0,0,0 to 1,2,3 with rel=abs)
g0 x1 y2 z3

(Offset the current point so abs 1,2,3 becomes rel 0,0,0)
g92 x0 y0 z0

(Go from rel 0,0,0 = abs 1,2,3 to rel 1,2,3 = abs 2,4,6)
g0 x1 y2 z3

(Cancel the offsets so the current point rel 1,2,3 = abs 2,4,6 becomes rel 2,4,6) 
g92.1

(Go from 2,4,6 to 0,0,0 with rel=abs)
g0 x0 y0 z0

(Change just one offset so rel=0,0,1)
g92 z1

(Go from rel 0,0,1 = abs 0,0,0 to rel 0,0,0 = abs 0,0,-1)
g0 z0

(Cancel the offsets using the alternate syntax - now rel is 0,0,-1)
g92

(Go from 0,0,-1 to 0,0,0 with rel=abs)
g0 z0
