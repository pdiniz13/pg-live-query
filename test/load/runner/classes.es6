var _ = require('lodash');

module.exports = _.flatten(_.range(instanceMultiplier).map(instance =>
	_.range(classCount).map(index => {

	var select = triggers.select(`
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
			score_id DESC
	`, [ index + 1 ]);

	select.on('update', (diff, rows) => {
		var scoreIds = '';
		if(diff.added) {
			scoreIds = diff.added.map(row => row.score_id).join(',')
		}
		console.log('CLASS_UPDATE', Date.now(), scoreIds);
	});

	return select;
})));
