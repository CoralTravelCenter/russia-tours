var log, queryParam, trouble;

window.ASAP = (function() {
  var callall, fns;
  fns = [];
  callall = function() {
    var f, results;
    results = [];
    while (f = fns.shift()) {
      results.push(f());
    }
    return results;
  };
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callall, false);
    window.addEventListener('load', callall, false);
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', callall);
    window.attachEvent('onload', callall);
  }
  return function(fn) {
    fns.push(fn);
    if (document.readyState === 'complete') {
      return callall();
    }
  };
})();

log = function() {
  if (window.console && window.DEBUG) {
    if (typeof console.group === "function") {
      console.group(window.DEBUG);
    }
    if (arguments.length === 1 && Array.isArray(arguments[0]) && console.table) {
      console.table.apply(window, arguments);
    } else {
      console.log.apply(window, arguments);
    }
    return typeof console.groupEnd === "function" ? console.groupEnd() : void 0;
  }
};

trouble = function() {
  var ref;
  if (window.console) {
    if (window.DEBUG) {
      if (typeof console.group === "function") {
        console.group(window.DEBUG);
      }
    }
    if ((ref = console.warn) != null) {
      ref.apply(window, arguments);
    }
    if (window.DEBUG) {
      return typeof console.groupEnd === "function" ? console.groupEnd() : void 0;
    }
  }
};

window.preload = function(what, fn) {
  var lib;
  if (!Array.isArray(what)) {
    what = [what];
  }
  return $.when.apply($, (function() {
    var j, len1, results;
    results = [];
    for (j = 0, len1 = what.length; j < len1; j++) {
      lib = what[j];
      results.push($.ajax(lib, {
        dataType: 'script',
        cache: true
      }));
    }
    return results;
  })()).done(function() {
    return typeof fn === "function" ? fn() : void 0;
  });
};

window.queryParam = queryParam = function(p, nocase) {
  var k, params, params_kv;
  params_kv = location.search.substr(1).split('&');
  params = {};
  params_kv.forEach(function(kv) {
    var k_v;
    k_v = kv.split('=');
    return params[k_v[0]] = k_v[1] || '';
  });
  if (p) {
    if (nocase) {
      for (k in params) {
        if (k.toUpperCase() === p.toUpperCase()) {
          return decodeURIComponent(params[k]);
        }
      }
      return void 0;
    } else {
      return decodeURIComponent(params[p]);
    }
  }
  return params;
};

String.prototype.zeroPad = function(len, c) {
  var s;
  s = '';
  c || (c = '0');
  len || (len = 2);
  len -= this.length;
  while (s.length < len) {
    s += c;
  }
  return s + this;
};

Number.prototype.zeroPad = function(len, c) {
  return String(this).zeroPad(len, c);
};

Number.prototype.formatPrice = function() {
  var s;
  s = String(Math.round(this));
  return s.split('').reverse().join('').replace(/\d{3}/g, "$& ").split('').reverse().join('');
};

window.DEBUG = 'REGIONAL PAGE';

ASAP(function() {
  var $flickityReady, $hotels_list, data_grid, desktop_layout, expandLinkWithDates, hotels_list, month, month_names, parseDataSource, renderMobileTable, responsiveHandler, tomorrow, wrapTilesBy;
  $('[data-content-remove]').each(function(idx, el) {
    var $el, marker;
    $el = $(el);
    marker = $el.attr('data-content-remove');
    return $("[data-content-marker='" + marker + "']").remove();
  });
  $flickityReady = $.Deferred();
  preload('https://cdnjs.cloudflare.com/ajax/libs/flickity/2.3.0/flickity.pkgd.min.js', function() {
    return $flickityReady.resolve();
  });
  if ($('[data-scrollto]').length) {
    preload('https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.3/jquery.scrollTo.min.js', function() {
      return $(document).on('click', '[data-scrollto]', function() {
        var $target;
        $target = $($(this).data('scrollto'));
        $(window).scrollTo($target.eq(0), 500, {
          margin: true,
          offset: -1 / 3 * window.innerHeight
        });
        $('.hilite-me').removeClass('hilite-me');
        return setTimeout(function() {
          return $target.addClass('hilite-me');
        }, 600);
      });
    });
  }
  responsiveHandler = function(query, match_handler, unmatch_handler) {
    var layout;
    layout = matchMedia(query);
    layout.addEventListener('change', function(e) {
      if (e.matches) {
        return match_handler();
      } else {
        return unmatch_handler();
      }
    });
    if (layout.matches) {
      match_handler();
    } else {
      unmatch_handler();
    }
    return layout;
  };
  wrapTilesBy = function(tiles_per_set) {
    var $slider, $tiles, $tiles_container, chunked_tiles;
    $slider = $('.tiled-slider');
    $slider.find('.tile-set').each(function(idx, tileset) {
      var $tileset;
      $tileset = $(tileset);
      return $tileset.replaceWith($tileset.children());
    });
    $tiles = $slider.find('.tile');
    chunked_tiles = _.chunk($tiles, tiles_per_set);
    $tiles_container = $tiles.eq(0).parent();
    $tiles.remove();
    chunked_tiles.forEach(function(chunk) {
      return $tiles_container.append($('<div class="tile-set"></div>').append(chunk));
    });
    if ($slider.hasClass('flickity-enabled')) {
      $slider.flickity('destroy');
    }
    $slider.flickity({
      initialIndex: localStorage.getItem('regions-slider-idx') || 0,
      cellSelector: '.tile-set',
      cellAlign: 'left',
      contain: true,
      prevNextButtons: true,
      pageDots: false,
      freeScroll: false
    }).on('scroll.flickity', function(e, progress) {
      var $scrubber, $this, W, l_percent, w;
      $this = $(this);
      $scrubber = $this.find('.progress-scrubber');
      W = $this.find('.progress-scale').width();
      w = $scrubber.width();
      if (progress < 0) {
        progress = 0;
      }
      if (progress > 1) {
        progress = 1;
      }
      l_percent = progress * (1 - w / W) * 100;
      return $scrubber.css({
        left: l_percent + '%'
      });
    }).on('select.flickity', function(e, idx) {
      return localStorage.setItem('regions-slider-idx', idx);
    });
    $slider.append($slider.find('.progress-indicator'));
    $slider.find('.progress-scrubber').css({
      width: tiles_per_set / $tiles.length * 100 + '%'
    });
    return _.defer(function() {
      return $slider.flickity('resize');
    });
  };
  if ($('.tiled-slider').length) {
    $.when($flickityReady).done(function() {
      return responsiveHandler('(min-width: 769px)', function() {
        return wrapTilesBy(7);
      }, function() {
        return wrapTilesBy(4);
      });
    });
  }
  month = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  tomorrow = moment().hours(0).minutes(0).seconds(0).add(1, 'day');
  expandLinkWithDates = function(href, dates_list) {
    var duration, params_strings, query, query_string, query_url, ref;
    ref = href.split('?'), query_url = ref[0], query_string = ref[1];
    query = {};
    if (query_string) {
      params_strings = query_string.split('&');
      params_strings.forEach(function(ps) {
        var k, ref1, v;
        ref1 = ps.split('='), k = ref1[0], v = ref1[1];
        return query[k] = JSON.parse(decodeURIComponent(v));
      });
      duration = moment(query.q.End, 'DD.MM.YYY').diff(moment(query.q.Bgn, 'DD.MM.YYY'));
      return dates_list.map(function(date) {
        var new_params, q;
        q = JSON.parse(JSON.stringify(query));
        q.q.Bgn = date.format('DD.MM.YYYY');
        q.q.End = moment(date).add(duration).format('DD.MM.YYYY');
        new_params = _.transform(q, function(result, v, k) {
          return result.push(k + "=" + (encodeURIComponent(JSON.stringify(v))));
        }, []);
        href = new_params.join('&');
        return "<a href='" + query_url + "?" + href + "'>" + (date.date()) + "</a>";
      });
    } else {
      return [];
    }
  };
  parseDataSource = function($ugly_cms_table) {
    var $table, add_a_year, data_grid, days, nights, recent_m_idx, tour_href, tour_name;
    $table = $($ugly_cms_table);
    data_grid = [];
    tour_name = tour_href = days = nights = void 0;
    recent_m_idx = -1;
    add_a_year = 0;
    $table.find('th, thead td').each(function(th_idx, th) {
      var $th, column_end_date, column_start_date, m_idx;
      if (!th_idx) {
        return;
      }
      $th = $(th);
      m_idx = month.indexOf($th.text().replace(/\s/g, '').toLowerCase());
      add_a_year = add_a_year || (m_idx < recent_m_idx ? 12 : 0);
      recent_m_idx = m_idx;
      column_start_date = moment().date(1).hours(0).minutes(0).seconds(0).month(m_idx + add_a_year);
      column_end_date = moment(column_start_date).endOf('month');
      if (tomorrow.valueOf() <= column_end_date.valueOf()) {
        return $table.find('tbody tr').each(function(tr_idx, tr) {
          var $tr;
          $tr = $(tr);
          return $tr.find('td').each(function(td_idx, td) {
            var $td, m;
            $td = $(td);
            if (td_idx === 0) {
              m = $td.text().replace(/\r|\n/g, ' ').match(/(\d+)[^\/]*\/(\d+)\s*[нН]\s+(.+)/);
              if (m) {
                tour_name = m[3];
                days = m[1];
                nights = m[2];
              } else {
                tour_name = $td.text().replace(/\s+/g, ' ');
                days = nights = 0;
              }
              return tour_href = $td.find('a').attr('href');
            } else if (td_idx === th_idx) {
              return $td.find('a').each(function(idx, a) {
                var link_text, links, look4dates, look4days, run, run_date, since, till, weekday_matchers;
                link_text = $(a).text();
                if (run_date = Number(link_text)) {
                  run_date = moment(column_start_date).date(run_date);
                  if (run_date.valueOf() >= tomorrow.valueOf()) {
                    return data_grid.push({
                      timestamp: run_date.valueOf(),
                      tour_uniq_name: nights + '-' + tour_name,
                      tour_name: tour_name,
                      tour_href: tour_href,
                      days: days,
                      nights: nights,
                      month_name: month[m_idx],
                      month_idx: m_idx,
                      date: run_date.date(),
                      html: a.outerHTML
                    });
                  }
                } else {
                  weekday_matchers = [new RegExp('во?с', 'i'), new RegExp('по?н', 'i'), new RegExp('вт', 'i'), new RegExp('ср', 'i'), new RegExp('че?т', 'i'), new RegExp('пя?т', 'i'), new RegExp('су?б', 'i')];
                  look4days = _.compact(weekday_matchers.map(function(matcher, idx) {
                    if (matcher.test(link_text)) {
                      return idx + 1;
                    } else {
                      return void 0;
                    }
                  }));
                  if (look4days.length) {
                    look4days = look4days.map(function(i) {
                      return --i;
                    });
                    run = since = moment(moment.max(column_start_date, tomorrow));
                    till = column_end_date;
                    look4dates = [];
                    while (run.isBefore(till)) {
                      if (look4days.indexOf(run.day()) > -1) {
                        look4dates.push(moment(run));
                      }
                      run.add(1, 'day');
                    }
                    links = expandLinkWithDates($(a).attr('href'), look4dates);
                    return links.forEach(function(link) {
                      return data_grid.push({
                        timestamp: column_start_date.valueOf(),
                        tour_uniq_name: nights + '-' + tour_name,
                        tour_name: tour_name,
                        tour_href: tour_href,
                        days: days,
                        nights: nights,
                        month_name: month[m_idx],
                        month_idx: m_idx,
                        date: $(link).text(),
                        html: link
                      });
                    });
                  } else {
                    return data_grid.push({
                      timestamp: column_start_date.valueOf(),
                      tour_uniq_name: nights + '-' + tour_name,
                      tour_name: tour_name,
                      tour_href: tour_href,
                      days: days,
                      nights: nights,
                      month_name: month[m_idx],
                      month_idx: m_idx,
                      date: $(a).text(),
                      html: a.outerHTML
                    });
                  }
                }
              });
            }
          });
        });
      }
    });
    return data_grid;
  };
  window.data_grid = data_grid = parseDataSource('[data-hotels-datasource]');
  month_names = _(data_grid).groupBy('month_name').keys().value();
  data_grid.sort(function(a, b) {
    return Number(a.days) < Number(b.days) && -1 || (Number(a.days) > Number(b.days) && 1) || 0;
  });
  renderMobileTable = function(primary_field, secondary_field) {
    var by_primary, primary_keys;
    by_primary = _.groupBy(data_grid, primary_field);
    primary_keys = _.keys(by_primary);
    if (primary_field === 'month_name') {
      primary_keys.sort(function(a, b) {
        return by_primary[a][0].timestamp - by_primary[b][0].timestamp;
      });
    }
    return Mustache.render($('#_tours_table_mobile_template').html(), {
      primaries: primary_keys.map(function(primary_key) {
        var by_secondary, primary, primary_name;
        by_secondary = _.groupBy(by_primary[primary_key], secondary_field);
        primary_name = by_primary[primary_key][0][primary_field.replace('_uniq', '')];
        return primary = {
          primary_name: primary_name,
          days: primary_field.match(/tour/) && by_primary[primary_key][0].days,
          nights: primary_field.match(/tour/) && by_primary[primary_key][0].nights,
          scroll_marker: primary_field.match(/tour/) && primary_name.replace(/\s/g, '').toUpperCase() || '',
          secondaries: _.keys(by_secondary).map(function(secondary_key) {
            var ref, secondary, secondary_name;
            secondary_name = by_secondary[secondary_key][0][secondary_field.replace('_uniq', '')];
            return secondary = {
              secondary_name: secondary_name,
              days: secondary_field.match(/tour/) && by_secondary[secondary_key][0].days,
              nights: secondary_field.match(/tour/) && by_secondary[secondary_key][0].nights,
              scroll_marker: (primary_field.match(/tour/) && primary_name || secondary_name).replace(/\s/g, '').toUpperCase() || '',
              contenu: ((ref = by_secondary[secondary_key]) != null ? ref.map(function(data) {
                return data.html;
              }).join('') : void 0) || ' '
            };
          })
        };
      })
    });
  };
  if (data_grid.length) {
    desktop_layout = responsiveHandler('(min-width: 769px)', function() {
      var by_tour;
      by_tour = _.groupBy(data_grid, 'tour_uniq_name');
      return $('#_tours_table').empty().append(Mustache.render($('#_tours_table_desktop_template').html(), {
        heading_cells: month_names,
        tour_datas: _.keys(by_tour).map(function(tour_uniq_name) {
          var by_month, tour_data, tour_name;
          by_month = _.groupBy(by_tour[tour_uniq_name], 'month_name');
          tour_name = by_tour[tour_uniq_name][0].tour_name;
          return tour_data = {
            tour_name: tour_name,
            scroll_marker: tour_name.replace(/\s/g, '').toUpperCase(),
            days: by_tour[tour_uniq_name][0].days,
            nights: by_tour[tour_uniq_name][0].nights,
            data_cells: month_names.map(function(month_name) {
              var data_cell, ref, ref1;
              return data_cell = {
                lots_of_content: ((ref = by_month[month_name]) != null ? ref.length : void 0) > 6,
                content: ((ref1 = by_month[month_name]) != null ? ref1.map(function(data) {
                  return data.html;
                }).join('') : void 0) || ' '
              };
            })
          };
        })
      }));
    }, function() {
      var opt;
      opt = $('[data-term-option].selected').attr('data-term-option');
      if (opt === 'tour') {
        return $('#_tours_table').empty().append(renderMobileTable('tour_uniq_name', 'month_name'));
      } else if (opt === 'month') {
        return $('#_tours_table').empty().append(renderMobileTable('month_name', 'tour_uniq_name'));
      }
    });
    $('[data-term-option]').on('click', function() {
      var $this, opt;
      $this = $(this);
      opt = $this.attr('data-term-option');
      $this.addClass("selected").siblings('.selected').removeClass('selected');
      if (!desktop_layout.matches) {
        if (opt === 'tour') {
          return $('#_tours_table').empty().append(renderMobileTable('tour_uniq_name', 'month_name'));
        } else if (opt === 'month') {
          return $('#_tours_table').empty().append(renderMobileTable('month_name', 'tour_uniq_name'));
        }
      }
    });
  }
  $('[data-hotels-datasource]').remove();
  hotels_list = $('.carouselcontainer .owl-carousel a').map(function(idx, a) {
    var $a, $visual, hotel_data, price;
    $a = $(a);
    $visual = $a.find('.imagewrapper img');
    price = Number($a.find('.price').text().replace(',', '.').replace(/[^0-9.]/g, ''));
    return hotel_data = {
      book_href: $a.attr('href'),
      visual_url: $visual.attr('src') || $visual.attr('data-src'),
      stars: $a.find('.stars').children().length,
      name: $a.find('.content h3').text(),
      location: $a.find('.content h3 + p').text(),
      terms: $a.find('.content h3 + p + em').text(),
      flight_included: !!$a.find('.flight').length,
      price: price,
      price_formatted: price.formatPrice()
    };
  }).toArray();
  $hotels_list = $('.recommended .hotels-list');
  if (hotels_list.length && $hotels_list.length) {
    $hotels_list.prepend(Mustache.render($('#_hotels_list_template').html(), {
      hotels_list: hotels_list
    }));
    $.when($flickityReady).done(function() {
      var $slider;
      $slider = $hotels_list.flickity({
        cellSelector: '.hotel-item',
        groupCells: true,
        cellAlign: 'center',
        contain: true,
        prevNextButtons: true,
        pageDots: false
      }).on('scroll.flickity', function(e, progress) {
        var $scrubber, $this, W, l_percent, w;
        $this = $(this);
        $scrubber = $this.find('.progress-scrubber');
        W = $this.find('.progress-scale').width();
        w = $scrubber.width();
        if (progress < 0) {
          progress = 0;
        }
        if (progress > 1) {
          progress = 1;
        }
        l_percent = progress * (1 - w / W) * 100;
        return $scrubber.css({
          left: l_percent + '%'
        });
      });
      $slider.append($slider.find('.progress-indicator'));
      _.defer(function() {
        return $slider.flickity('resize');
      });
      responsiveHandler('(min-width: 769px)', function() {
        $slider = $('.recommended .hotels-list');
        return $slider.find('.progress-scrubber').css({
          width: _.clamp(3 / $slider.data('flickity').cells.length * 100, 100) + '%'
        });
      }, function() {
        $slider = $('.recommended .hotels-list');
        return $slider.find('.progress-scrubber').css({
          width: _.clamp(2 / $slider.data('flickity').cells.length * 100, 100) + '%'
        });
      });
      return responsiveHandler('(min-width: 577px)', function() {
        $slider = $('.recommended .hotels-list');
        return $slider.find('.progress-scrubber').css({
          width: _.clamp(2 / $slider.data('flickity').cells.length * 100, 100) + '%'
        });
      }, function() {
        $slider = $('.recommended .hotels-list');
        return $slider.find('.progress-scrubber').css({
          width: _.clamp(1 / $slider.data('flickity').cells.length * 100, 100) + '%'
        });
      });
    });
  } else {
    $hotels_list.closest('section').remove();
  }
  return $('.video-box .play').on('click', function() {
    var $vbox, v;
    $vbox = $(this).closest('.video-box');
    v = $vbox.find('video').get(0);
    v.play();
    return $vbox.find('.poster,.ctl').fadeOut(function() {
      return $(v).attr({
        controls: true
      });
    });
  });
});
