var curr = 0;

console.log('worker created', self, curr, self.max);

var max = 0;
var rand = function() {return 0};
var flip = function() {return (rand() >= 0.5 ? 1 : 0) };

var rule0 = [ [0, 0], [0, 1], [1, 0], [1, 1] ];
var rule1 = [ [ [0, 0], [0, 0] ], [ [0, 0], [0, 1] ], [ [0, 0], [1, 0] ], [ [0, 0], [1, 1] ], 
              [ [0, 1], [0, 0] ], [ [0, 1], [0, 1] ], [ [0, 1], [1, 0] ], [ [0, 1], [1, 1] ], 
              [ [1, 0], [0, 0] ], [ [1, 0], [0, 1] ], [ [1, 0], [1, 0] ], [ [1, 0], [1, 1] ], 
              [ [1, 1], [0, 0] ], [ [1, 1], [0, 1] ], [ [1, 1], [1, 0] ], [ [1, 1], [1, 1] ] ];

//console.log(rule0, rule1);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('Taking a break...');
  await sleep(2000);
  console.log('Two seconds later');
}

var methods = {
    init: function(seed, x, y, max) {
        self.max = max;
        self.rand = Alea(seed);
        self.x = x;
        self.y = y;
        self.name = "worker" + x + "-" + y;
        self.pos = flip();
        self.bits = flip();
        self.hov = flip();
        self.dir = flip();
        console.log(self, seed, self.rand(), self.x, self.y, self.pos, self.bits, self.hov, self.dir);
        postMessage({ method: 'ready', args: [self.name, self.x, self.y] });
    },
    next: async function() {
        var ms = Math.floor(rand() * 1000);
        console.log(self.name, 'sleep', ms);
        await sleep(ms);
        self.pos = Number(!self.pos); // negates
        postMessage({ method: 'peek', args: [self.name, self.x, self.y, self.pos, self.bits, self.hov, self.dir] });
    },
    show: function(v0, v1) {
        //console.log(self.name, 'shown', v0, v1);
        if(self.curr < self.max) {
            if(self.bits == 0){
                var r = 2 * flip() + flip();
                self.rule = rule0[r];
                self.out = rule[v0];
            }
            else {
                var r0 = 2 * flip() + flip();
                var r1 = 2 * flip() + flip();
                self.rule = rule1[r0][r1];
                self.out = rule[v0, v1];
            }
            self.curr++;
            console.log(self.name, 'calc', self.rule, self.out, 'n: ' + self.curr + ' of m: ' + self.max);
            postMessage({ method: 'update', args: [self.name, self.x, self.y, self.pos, self.out] });
            if(self.curr < self.max) 
                postMessage({ method: 'ready', args: [self.name, self.x, self.y] });
            else
                postMessage({ method: 'done', args: [self.name, self.x, self.y] });
        }
        else {
            postMessage({ method: 'oops', args: [self.name, self.x, self.y] });
        }
    }
}

onmessage = function(e) {
    if (e.data instanceof Object &&
        //e.data.hasOwnProperty('') &&
        e.data.hasOwnProperty('method') &&
        e.data.hasOwnProperty('args')) {
        methods[e.data.method]
            .apply(self, e.data.args);
    } else {
        console.log('unknown method', self, e.data);
    }
}


function Alea(seed) {
    if(seed === undefined) {seed = +new Date() + Math.random();}
    function Mash() {
        var n = 4022871197;
        return function(r) {
            for(var t, s, u = 0, e = 0.02519603282416938; u < r.length; u++)
            s = r.charCodeAt(u), f = (e * (n += s) - (n*e|0)),
            n = 4294967296 * ((t = f * (e*n|0)) - (t|0)) + (t|0);
            return (n|0) * 2.3283064365386963e-10;
        }
    }
    return function() {
        var m = Mash(), a = m(" "), b = m(" "), c = m(" "), x = 1, y;
        seed = seed.toString(), a -= m(seed), b -= m(seed), c -= m(seed);
        a < 0 && a++, b < 0 && b++, c < 0 && c++;
        return function() {
            var y = x * 2.3283064365386963e-10 + a * 2091639; a = b, b = c;
            return c = y - (x = y|0);
        };
    }();
}

