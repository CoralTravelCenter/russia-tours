window.ASAP = (->
    fns = []
    callall = () ->
        f() while f = fns.shift()
    if document.addEventListener
        document.addEventListener 'DOMContentLoaded', callall, false
        window.addEventListener 'load', callall, false
    else if document.attachEvent
        document.attachEvent 'onreadystatechange', callall
        window.attachEvent 'onload', callall
    (fn) ->
        fns.push fn
        callall() if document.readyState is 'complete'
)()

log = () ->
    if window.console and window.DEBUG
        console.group? window.DEBUG
        if arguments.length == 1 and Array.isArray(arguments[0]) and console.table
            console.table.apply window, arguments
        else
            console.log.apply window, arguments
        console.groupEnd?()
trouble = () ->
    if window.console
        console.group? window.DEBUG if window.DEBUG
        console.warn?.apply window, arguments
        console.groupEnd?() if window.DEBUG

window.preload = (what, fn) ->
    what = [what] unless  Array.isArray(what)
    $.when.apply($, ($.ajax(lib, dataType: 'script', cache: true) for lib in what)).done -> fn?()

window.queryParam = queryParam = (p, nocase) ->
    params_kv = location.search.substr(1).split('&')
    params = {}
    params_kv.forEach (kv) -> k_v = kv.split('='); params[k_v[0]] = k_v[1] or ''
    if p
        if nocase
            return decodeURIComponent(params[k]) for k of params when k.toUpperCase() == p.toUpperCase()
            return undefined
        else
            return decodeURIComponent params[p]
    params

String::zeroPad = (len, c) ->
    s = ''
    c ||= '0'
    len ||= 2
    len -= @length
    s += c while s.length < len
    s + @
Number::zeroPad = (len, c) -> String(@).zeroPad len, c

window.DEBUG = 'REGIONAL PAGE'

ASAP ->

    $('[data-content-remove]').each (idx, el) ->
        $el = $(el)
        marker = $el.attr 'data-content-remove'
        $("[data-content-marker='#{ marker }']").remove()

    $flickityReady = $.Deferred()
    preload 'https://cdnjs.cloudflare.com/ajax/libs/flickity/2.3.0/flickity.pkgd.min.js', -> $flickityReady.resolve()

    if $('[data-scrollto]').length
        preload 'https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.3/jquery.scrollTo.min.js', ->
            $(document).on 'click', '[data-scrollto]', ->
                $target = $($(this).data('scrollto'))
                $(window).scrollTo $target.eq(0), 500, { margin: true, offset: -1/3 * window.innerHeight }
                $('.hilite-me').removeClass 'hilite-me'
                setTimeout ->
                    $target.addClass 'hilite-me'
                , 600

    responsiveHandler = (query, match_handler, unmatch_handler) ->
        layout = matchMedia query
        layout.addEventListener 'change', (e) ->
            if e.matches then match_handler() else unmatch_handler()
        if layout.matches then match_handler() else unmatch_handler()
        layout

    wrapTilesBy = (tiles_per_set) ->
        $slider = $('.tiled-slider')
        $slider.find('.tile-set').each (idx, tileset) ->
            $tileset = $(tileset)
            $tileset.replaceWith $tileset.children()
        $tiles = $slider.find('.tile')
        chunked_tiles = _.chunk $tiles, tiles_per_set
        $tiles_container = $tiles.eq(0).parent()
        $tiles.remove()
        chunked_tiles.forEach (chunk) ->
            $tiles_container.append $('<div class="tile-set"></div>').append(chunk)
        if $slider.hasClass 'flickity-enabled'
            $slider.flickity 'destroy'
        $slider.flickity
            initialIndex: localStorage.getItem('regions-slider-idx') or 0
            cellSelector: '.tile-set'
            cellAlign: 'left'
            contain: yes
            prevNextButtons: yes
            pageDots: no
            freeScroll: no
        .on 'scroll.flickity', (e, progress) ->
            $scrubber = $('.progress-scrubber')
            W = $('.progress-scale').width()
            w = $scrubber.width()
            progress = 0 if progress < 0
            progress = 1 if progress > 1
            l_percent = progress * (1 - w/W) * 100
            $scrubber.css left: l_percent + '%'
        .on 'select.flickity', (e, idx) ->
            localStorage.setItem('regions-slider-idx', idx)
        $slider.append $slider.find('.progress-indicator')
        $slider.find('.progress-scrubber').css width: tiles_per_set/$tiles.length * 100 + '%'
        _.defer -> $slider.flickity 'resize'

    if $('.tiled-slider').length
        $.when($flickityReady).done ->
            responsiveHandler '(min-width: 769px)',
                -> wrapTilesBy(7)
                -> wrapTilesBy(4)

    month = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']
    tomorrow = moment().hours(0).minutes(0).seconds(0).add(1, 'day')

    expandLinkWithDates = (href, dates_list) ->
        [query_url, query_string] = href.split('?')
        query = {}
        if query_string
            params_strings = query_string.split('&')
            params_strings.forEach (ps) ->
                [k, v] = ps.split('=')
                query[k] = JSON.parse decodeURIComponent(v)
            duration = moment(query.q.End, 'DD.MM.YYY').diff moment(query.q.Bgn, 'DD.MM.YYY')
            return dates_list.map (date) ->
                q = JSON.parse JSON.stringify query
                q.q.Bgn = date.format('DD.MM.YYYY')
                q.q.End = moment(date).add(duration).format('DD.MM.YYYY')
                new_params = _.transform q, (result, v, k) ->
                    result.push "#{ k }=#{ encodeURIComponent JSON.stringify(v) }"
                , []
                href = new_params.join '&'
                "<a href='#{ query_url }?#{ href }'>#{ date.date() }</a>"
        else
            return []

    parseDataSource = ($ugly_cms_table) ->
        $table = $($ugly_cms_table)
        data_grid = []
        tour_name = tour_href = days = nights = undefined
        $table.find('th, thead td').each (th_idx, th) ->
            return unless th_idx
            $th = $(th)
            m_idx = month.indexOf($th.text().replace(/\s/g,'').toLowerCase())
            column_start_date = moment().date(1).hours(0).minutes(0).seconds(0).month(m_idx)
#            column_end_date = moment(column_start_date).add(1, 'month')
            column_end_date = moment(column_start_date).endOf('month')
            if tomorrow.valueOf() <= column_end_date.valueOf()
                $table.find('tbody tr').each (tr_idx, tr) ->
                    $tr = $(tr)
                    $tr.find('td').each (td_idx, td) ->
                        $td = $(td)
                        if td_idx == 0
                            m = $td.text().replace(/\r|\n/g, ' ').match(/(\d+)[^\/]*\/(\d+)\s*[нН]\s+(.+)/)
                            if m
                                tour_name = m[3]
                                days = m[1]
                                nights = m[2]
                            else
                                tour_name = $td.text().replace(/\s+/g, ' ')
                                days = nights = 0
                            tour_href = $td.find('a').attr('href')
                        else if td_idx == th_idx
                            $td.find('a').each (idx, a) ->
                                link_text = $(a).text()
                                if run_date = Number(link_text)
                                    run_date = moment(column_start_date).date(run_date)
                                    if run_date.valueOf() >= tomorrow.valueOf()
                                        data_grid.push
                                            timestamp: run_date.valueOf()
                                            tour_uniq_name: nights + '-' + tour_name
                                            tour_name: tour_name
                                            tour_href: tour_href
                                            days: days
                                            nights: nights
                                            month_name: month[m_idx]
                                            month_idx: m_idx
                                            date: run_date.date()
                                            html: a.outerHTML
                                else
                                    # try to covert implicit specs ie "по средам и пятницам" to dates series
                                    weekday_matchers = [new RegExp('во?с', 'i'), new RegExp('по?н', 'i'), new RegExp('вт', 'i'), new RegExp('ср', 'i'), new RegExp('че?т', 'i'), new RegExp('пя?т', 'i'), new RegExp('су?б', 'i')]
                                    look4days = _.compact weekday_matchers.map (matcher, idx) -> if matcher.test(link_text) then idx + 1 else undefined
                                    if look4days.length
                                        look4days = look4days.map (i) -> --i
                                        run = since = moment(moment.max(column_start_date, tomorrow))
                                        till = column_end_date
                                        look4dates = []
                                        while run.isBefore till
                                            look4dates.push moment(run) if look4days.indexOf(run.day()) > -1
                                            run.add 1, 'day'
                                        links = expandLinkWithDates $(a).attr('href'), look4dates
                                        links.forEach (link) ->
                                            data_grid.push
                                                timestamp: column_start_date.valueOf()
                                                tour_uniq_name: nights + '-' + tour_name
                                                tour_name: tour_name
                                                tour_href: tour_href
                                                days: days
                                                nights: nights
                                                month_name: month[m_idx]
                                                month_idx: m_idx
                                                date: $(link).text()
                                                html: link
                                    else
                                        data_grid.push
                                            timestamp: column_start_date.valueOf()
                                            tour_uniq_name: nights + '-' + tour_name
                                            tour_name: tour_name
                                            tour_href: tour_href
                                            days: days
                                            nights: nights
                                            month_name: month[m_idx]
                                            month_idx: m_idx
                                            date: $(a).text()
                                            html: a.outerHTML
        data_grid


    window.data_grid = data_grid = parseDataSource '[data-hotels-datasource]'
    month_names = _(data_grid).groupBy('month_name').keys().value()
    data_grid.sort (a, b) -> Number(a.days) < Number(b.days) and -1 or (Number(a.days) > Number(b.days) and 1) or 0

    renderMobileTable = (primary_field, secondary_field) ->
        by_primary = _.groupBy data_grid, primary_field
        primary_keys = _.keys(by_primary)
        if primary_field == 'month_name'
            primary_keys.sort (a, b) ->
                aidx = month.indexOf(a)
                bidx = month.indexOf(b)
                aidx < bidx and -1 or (aidx > bidx and 1) or 0
        Mustache.render $('#_tours_table_mobile_template').html(),
            primaries: primary_keys.map (primary_key) ->
                by_secondary = _.groupBy by_primary[primary_key], secondary_field
                primary_name = by_primary[primary_key][0][primary_field.replace('_uniq','')]
                primary =
                    primary_name: primary_name
                    days: primary_field.match(/tour/) and by_primary[primary_key][0].days
                    nights: primary_field.match(/tour/) and by_primary[primary_key][0].nights
                    scroll_marker: primary_field.match(/tour/) and primary_name.replace(/\s/g,'').toUpperCase() or ''
                    secondaries: _.keys(by_secondary).map (secondary_key) ->
                        secondary_name = by_secondary[secondary_key][0][secondary_field.replace('_uniq','')]
                        secondary =
                            secondary_name: secondary_name
                            days: secondary_field.match(/tour/) and by_secondary[secondary_key][0].days
                            nights: secondary_field.match(/tour/) and by_secondary[secondary_key][0].nights
                            scroll_marker: (primary_field.match(/tour/) and primary_name or secondary_name).replace(/\s/g,'').toUpperCase() or ''
                            contenu: by_secondary[secondary_key]?.map((data) -> data.html).join('') or ' '


    if data_grid.length
        desktop_layout = responsiveHandler '(min-width: 769px)',
            ->
#                by_tour = _.groupBy(data_grid, 'tour_name')
                by_tour = _.groupBy(data_grid, 'tour_uniq_name')
                $('#_tours_table').empty().append Mustache.render $('#_tours_table_desktop_template').html(),
                    heading_cells: month_names
                    tour_datas: _.keys(by_tour).map (tour_uniq_name) ->
                        by_month = _.groupBy by_tour[tour_uniq_name], 'month_name'
                        tour_name = by_tour[tour_uniq_name][0].tour_name
                        tour_data =
                            tour_name: tour_name
                            scroll_marker: tour_name.replace(/\s/g,'').toUpperCase()
                            days: by_tour[tour_uniq_name][0].days
                            nights: by_tour[tour_uniq_name][0].nights
                            data_cells: month_names.map (month_name) ->
                                data_cell =
                                    lots_of_content: by_month[month_name]?.length > 6
                                    content: by_month[month_name]?.map((data) -> data.html).join('') or ' '
            ->
                opt = $('[data-term-option].selected').attr('data-term-option')
                if opt == 'tour'
                    $('#_tours_table').empty().append renderMobileTable('tour_uniq_name', 'month_name')
                else if opt == 'month'
                    $('#_tours_table').empty().append renderMobileTable('month_name', 'tour_uniq_name')
        $('[data-term-option]').on 'click', ->
            $this = $(this)
            opt = $this.attr 'data-term-option'
            $this.addClass("selected").siblings('.selected').removeClass('selected')
            unless desktop_layout.matches
                if opt == 'tour'
                    $('#_tours_table').empty().append renderMobileTable('tour_uniq_name', 'month_name')
                else if opt == 'month'
                    $('#_tours_table').empty().append renderMobileTable('month_name', 'tour_uniq_name')


    $('[data-hotels-datasource]').remove()


    # Handling hotels list
    hotels_list = $('.carouselcontainer .owl-carousel a').map (idx, a) ->
        $a = $(a)
        $visual = $a.find('.imagewrapper img')
        price = Number($a.find('.price').text().replace(',', '.').replace(/[^0-9.]/g, ''))
        hotel_data =
            book_href:       $a.attr('href')
            visual_url:      $visual.attr('src') or $visual.attr('data-src')
            stars:           $a.find('.stars').children().length
            name:            $a.find('.content h3').text()
            location:        $a.find('.content h3 + p').text()
            terms:           $a.find('.content h3 + p + em').text()
            flight_included: !!$a.find('.flight').length
            price:           price
            price_formatted: price.formatPrice()
    .toArray()
    $hotels_list = $('.recommended .hotels-list')
    if hotels_list.length and $hotels_list.length
        $hotels_list.empty().append Mustache.render $('#_hotels_list_template').html(), hotels_list: hotels_list
#    else
#        $hotels_list.closest('section').remove()

    $('.video-box .play').on 'click', ->
        $vbox = $(this).closest '.video-box'
        v = $vbox.find('video').get(0)
        v.play()
        $vbox.find('.poster,.ctl').fadeOut -> $(v).attr controls: yes
