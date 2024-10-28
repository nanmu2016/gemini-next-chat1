import { NextResponse, type NextRequest } from 'next/server'
import OASNormalize from 'oas-normalize'
import { ErrorType } from '@/constant/errors'
import { handleError } from '../utils'
import { isNull } from 'lodash-es'

export const preferredRegion = ['sfo1']

const mode = process.env.NEXT_PUBLIC_BUILD_MODE

export async function GET(req: NextRequest) {
  if (mode === 'export') return new NextResponse('Not available under static deployment')

  const searchParams = req.nextUrl.searchParams
  const openapi = searchParams.get('openapi')

  if (isNull(openapi)) {
    return NextResponse.json({ code: 40001, message: ErrorType.MissingParam }, { status: 400 })
  }

  try {
    try {
      const oasNormalize = new OASNormalize(openapi)
      const openApiDocument = await oasNormalize.validate({ convertToLatest: true })
      return NextResponse.json(openApiDocument)
    } catch (err) {
      if (err instanceof Error) {
        return NextResponse.json({ code: 50001, message: err.message }, { status: 500 })
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
