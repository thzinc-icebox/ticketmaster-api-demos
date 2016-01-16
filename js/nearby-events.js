$(function () {
	function getEventsByPosition(position, widget) {
		var list = widget.find('.nearby-events__list');
		var apikey = widget.attr('apikey');
		var template = widget.find('script.nearby-events__list__item_template').text();

		$.ajax({
			type: 'GET',
			url: 'https://app.ticketmaster.com/discovery/v1/events.json',
			data: {
				'apikey': apikey,
				'size': 5,
				'latlong': position.coords.latitude + ',' + position.coords.longitude,
				'radius': 15,
				'sort': 'eventDate,asc',
			},
			async: true,
			dataType: 'json',
		})
			.done(function(response) {
				list.empty();
				var events = response._embedded.events;
				console.table(events);
				var listItems = events
					.map(function(self) {
						var dateParts = self.dates.start.localDate.split('-');

						var shortMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dateParts[1] - 1];
						var data = {
							name: self.name,
							shortMonth: shortMonth,
							day: dateParts[2],
							venueName: self._embedded.venue[0].name,
							venueCity: self._embedded.venue[0].city.name,
						};
						var url = 'https://www.ticketmaster.com' + self._embedded.attractions[0].url;
						var item = $(Mustache.to_html(template, data));

						item.on('click.nearbyEvents', function () {
							location.href = url;
						})

						return item;
					});
				list.append(listItems);
			})
			.fail(function(xhr, status, err) {
				list.empty();
				list.append($('<strong/>').text('Could not load nearby events'));
			});
	};

	$('.nearby-events')
		.each(function () {
			var self = $(this);


			navigator.geolocation.getCurrentPosition(function (position) {
				getEventsByPosition(position, self);
			});
		});
});