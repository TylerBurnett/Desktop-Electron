module.exports = (() => {
  var e = {
      309: (e, t, n) => {
        'use strict';
        var o, r;
        n.r(t),
          (function (e) {
            e.Config = 'Config';
          })(o || (o = {})),
          (function (e) {
            (e.Error = 'Error'),
              (e.Warning = 'Warning'),
              (e.Log = 'Log'),
              (e.AppConfig = 'AppConfig'),
              (e.GetComponents = 'GetComponents'),
              (e.GetComponent = 'GetComponent'),
              (e.SetComponent = 'SetComponent');
          })(r || (r = {}));
        var i = n(933),
          a = i.contextBridge,
          m = i.ipcRenderer,
          s = n(233);
        window.addEventListener('DOMContentLoaded', function () {
          var e = document.createElement('style');
          (e.type = 'text/css'),
            (e.innerHTML =
              'body {\n    -webkit-app-region: drag; \n    -webkit-user-select: none;\n  }'),
            document.getElementsByTagName('head')[0].appendChild(e);
        }),
          a.exposeInMainWorld('Component', {
            getSettings: function () {
              return m.invoke(r.GetComponent, []);
            },
            logInfo: function (e) {
              return m.invoke(r.Log, ['ComponentName', e]);
            },
            logWarning: function (e) {
              return m.invoke(r.Warning, ['ComponentName', e]);
            },
            logError: function (e) {
              return m.invoke(r.Warning, ['ComponentName', e]);
            },
          }),
          a.exposeInMainWorld('OS', {
            cpuUsage: s.cpuUsage,
            cpuFree: s.cpuFree,
            platform: s.platform,
            countCPUs: s.countCPUs,
            freemem: s.freemem,
            totalmem: s.totalmem,
            freememPercentage: s.freememPercentage,
            sysUptime: s.sysUptime,
            processUptime: s.processUptime,
            loadavg: s.loadavg,
          });
      },
      233: (e, t, n) => {
        var o = n(87);
        function r(e, t) {
          var n = i(),
            o = n.idle,
            r = n.total;
          setTimeout(function () {
            var n = i(),
              a = n.idle,
              m = n.total,
              s = (a - o) / (m - r);
            e(!0 === t ? s : 1 - s);
          }, 1e3);
        }
        function i(e) {
          var t = o.cpus(),
            n = 0,
            r = 0,
            i = 0,
            a = 0,
            m = 0;
          for (var s in t)
            (n += t[s].times.user),
              (r += t[s].times.nice),
              (i += t[s].times.sys),
              (m += t[s].times.irq),
              (a += t[s].times.idle);
          return { idle: a, total: n + r + i + a + m };
        }
        (t.platform = function () {
          return process.platform;
        }),
          (t.cpuCount = function () {
            return o.cpus().length;
          }),
          (t.sysUptime = function () {
            return o.uptime();
          }),
          (t.processUptime = function () {
            return process.uptime();
          }),
          (t.freemem = function () {
            return o.freemem() / 1048576;
          }),
          (t.totalmem = function () {
            return o.totalmem() / 1048576;
          }),
          (t.freememPercentage = function () {
            return o.freemem() / o.totalmem();
          }),
          (t.freeCommand = function (e) {
            n(129).exec('free -m', function (t, n, o) {
              var r = n
                .split('\n')[1]
                .replace(/[\s\n\r]+/g, ' ')
                .split(' ');
              (total_mem = parseFloat(r[1])),
                (free_mem = parseFloat(r[3])),
                (buffers_mem = parseFloat(r[5])),
                (cached_mem = parseFloat(r[6])),
                (used_mem = total_mem - (free_mem + buffers_mem + cached_mem)),
                e(used_mem - 2);
            });
          }),
          (t.harddrive = function (e) {
            n(129).exec('df -k', function (t, n, o) {
              var r,
                i,
                a,
                m = n
                  .split('\n')[1]
                  .replace(/[\s\n\r]+/g, ' ')
                  .split(' ');
              (r = Math.ceil((1024 * m[1]) / Math.pow(1024, 2))),
                (i = Math.ceil((1024 * m[2]) / Math.pow(1024, 2))),
                (a = Math.ceil((1024 * m[3]) / Math.pow(1024, 2))),
                e(r, a, i);
            });
          }),
          (t.getProcesses = function (e, t) {
            'function' == typeof e && ((t = e), (e = 0)),
              (command =
                'ps -eo pcpu,pmem,time,args | sort -k 1 -r | head -n10'),
              e > 0 &&
                (command =
                  'ps -eo pcpu,pmem,time,args | sort -k 1 -r | head -n' +
                  (e + 1)),
              n(129).exec(command, function (e, n, o) {
                var r = n.split('\n');
                r.shift(), r.pop();
                var i = '';
                r.forEach(function (e, t) {
                  var n = e.replace(/[\s\n\r]+/g, ' ');
                  (n = n.split(' ')),
                    (i +=
                      n[1] +
                      ' ' +
                      n[2] +
                      ' ' +
                      n[3] +
                      ' ' +
                      n[4].substring(n[4].length - 25) +
                      '\n');
                }),
                  t(i);
              });
          }),
          (t.allLoadavg = function () {
            var e = o.loadavg();
            return (
              e[0].toFixed(4) + ',' + e[1].toFixed(4) + ',' + e[2].toFixed(4)
            );
          }),
          (t.loadavg = function (e) {
            (void 0 === e || (5 !== e && 15 !== e)) && (e = 1);
            var t = o.loadavg(),
              n = 0;
            return (
              1 == e && (n = t[0]),
              5 == e && (n = t[1]),
              15 == e && (n = t[2]),
              n
            );
          }),
          (t.cpuFree = function (e) {
            r(e, !0);
          }),
          (t.cpuUsage = function (e) {
            r(e, !1);
          });
      },
      129: (e) => {
        'use strict';
        e.exports = require('child_process');
      },
      933: (e) => {
        'use strict';
        e.exports = require('electron');
      },
      87: (e) => {
        'use strict';
        e.exports = require('os');
      },
    },
    t = {};
  function n(o) {
    if (t[o]) return t[o].exports;
    var r = (t[o] = { exports: {} });
    return e[o](r, r.exports, n), r.exports;
  }
  return (
    (n.r = (e) => {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    }),
    n(309)
  );
})();
