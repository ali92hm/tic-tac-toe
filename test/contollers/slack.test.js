const slackController = require('../../app/controllers/slack')

describe('tttRequestValidator(body)', () => {
  var body

  beforeEach(() => {
    body = {
      team_id: 'A345n56',
      channel_id: 'B42q43ju',
      user_id: 'U347jsh',
      text: 'Some sample test'
    }
  })

  test('should return undefined for complete body', () => {
    expect(slackController.tttRequestValidator(body))
      .toBeUndefined()
  })

  test('should return undefined when text is empty string', () => {
    body.text = ''
    expect(slackController.tttRequestValidator(body))
      .toBeUndefined()
  })

  test('should return error when text field is not provided', () => {
    delete body.text
    let errors = slackController.tttRequestValidator(body)
    expect(errors).not.toBeUndefined()
    expect(errors).toEqual(['No "text" was passed.'])
  })

  test('should return error when team_id is empty string', () => {
    body.team_id = ''
    let errors = slackController.tttRequestValidator(body)
    expect(errors).not.toBeUndefined()
    expect(errors).toEqual(['No "team_id" was passed.'])
  })

  test('should return error when team_id is not provided', () => {
    delete body.team_id
    let errors = slackController.tttRequestValidator(body)
    expect(errors).not.toBeUndefined()
    expect(errors).toEqual(['No "team_id" was passed.'])
  })

  test('should return error when team_id channel_id is not provided', () => {
    delete body.team_id
    delete body.channel_id
    let errors = slackController.tttRequestValidator(body)
    expect(errors).not.toBeUndefined()
    expect(errors).toEqual(['No "team_id" was passed.', 'No "channel_id" was passed.'])
  })
})
