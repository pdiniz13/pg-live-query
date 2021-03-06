var _ = require('lodash')
var LiveSQL = require('../../../')

var liveDb = new LiveSQL(options.conn, options.channel)

liveDb.on('error', function(error) {
	console.error(error)
})

var selectCount = 
	settings.maxSelects && settings.maxSelects < settings.init.classCount ?
		settings.maxSelects : settings.init.classCount

module.exports = _.flatten(_.range(settings.instanceMultiplier || 1)
	.map(instance => _.range(selectCount).map(index => {

	var select = liveDb.select(`
		SELECT
			students.name  AS student_name,
			students.id    AS student_id,
			assignments.id AS assignment_id,
			scores.id      AS score_id,
			assignments.name,
			assignments.value,
			scores.score
		FROM
			scores
		INNER JOIN assignments ON
			(assignments.id = scores.assignment_id)
		INNER JOIN students ON
			(students.id = scores.student_id)
		WHERE
			assignments.class_id = $1
		ORDER BY
			score_id ASC
	`, [ index + 1 ], (diff, rows) => {
		var scoreIds = ''
		if(diff.added) {
			scoreIds = diff.added.map(row => row.score_id + '@' + row.score).join(',')
		}
		process.stdout.write([
			'CLASS_UPDATE',
			Date.now(),
			index + 1,
			liveDb.refreshCount,
			scoreIds
		].join(' '))
	})

	return select
})))

